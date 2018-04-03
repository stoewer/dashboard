import { NodeProvider } from './../../shared/model/NodeProviderConstants';
import { select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CreateClusterModel } from '../../shared/model/CreateClusterModel';
import { DataCenterEntity } from '../../shared/entity/DatacenterEntity';
import { DigitaloceanSize } from '../../shared/entity/provider/DigitaloceanSizeEntity';
import { Subscription } from 'rxjs/Subscription';
import { NodeEntity } from '../../shared/entity/NodeEntity';
import { ApiService } from '../../core/services';
import { WizardActions } from '../../redux/actions/wizard.actions';

@Component({
  selector: 'kubermatic-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})

export class SummaryComponent implements OnInit, OnDestroy {

  public providerNames = NodeProvider.ProviderNames;
  @select(['wizard', 'setProviderForm', 'provider']) provider$: Observable<string>;
  public provider: string;
  @select(['wizard', 'setDatacenterForm', 'datacenter']) region$: Observable<DataCenterEntity>;
  public region: DataCenterEntity;
  @select(['wizard', 'nodeModel']) nodeModel$: Observable<NodeEntity>;
  public nodeModel: NodeEntity;
  @select(['wizard', 'clusterModel']) clusterModel$: Observable<CreateClusterModel>;
  public clusterModel: CreateClusterModel;
  @select(['wizard', 'nodeForm', 'node_count']) nodeCount$: Observable<number>;
  public nodeCount: number;
  public sshKeysList: string[] = [];

  public doOptimizedSizes: DigitaloceanSize[];
  private subscriptions: Subscription[] = [];

  constructor(private api: ApiService) { }

  ngOnInit() {
    const subWizard = this.provider$.combineLatest(this.region$, this.nodeModel$, this.clusterModel$, this.nodeCount$)
      .subscribe((data: [string, DataCenterEntity, NodeEntity, CreateClusterModel, number]) => {
        const provider = data[0];
        const region = data[1];
        const nodeModel = data[2];
        const clusterModel = data[3];
        const nodeCount = data[4];


        provider && (this.provider = provider);
        region && (this.region = region);
        nodeModel && (this.nodeModel = nodeModel);
        clusterModel && (this.clusterModel = clusterModel);
        nodeCount && (this.nodeCount = nodeCount);
      });
    this.subscriptions.push(subWizard);

    if (this.provider !== 'bringyourown') {
      const subSSHKeys = this.getSSHKeys();
      this.subscriptions.push(subSSHKeys);
    }

    if (this.provider === 'digitalocean' && this.nodeModel.spec.cloud.digitalocean.size.match(/^(c)\-/)) {
      if (!this.doOptimizedSizes) {
        const subDoSizes = this.api.getDigitaloceanSizes(this.clusterModel.cluster.cloud.digitalocean.token).subscribe(result => {
          this.doOptimizedSizes = result.optimized;
        });
        this.subscriptions.push(subDoSizes);
      }
    }
  }

  public getSSHKeys(): Subscription {
    return this.api.getSSHKeys()
      .subscribe(
        result => {
          for (const item of result) {
            for (const key of this.clusterModel.sshKeys) {
              if (item.metadata.name === key) {
                this.sshKeysList.push(item.spec.name + ' - ' + item.spec.fingerprint);
              }
            }
          }
          this.sshKeysList.sort();
        }
      );
  }

  public getReadableSizes(doSize: string): string {
    if (doSize.match(/^(s)\-/)) {
      const cpu = doSize.match(/\-(\d+)\w+\-/);
      const gb = doSize.match(/\-(\d+)\w+$/);
      return gb[1] + ' GB RAM, ' + cpu[1] + ' CPUs';
    } else {
      let gb: number;
      let cpu: number;
      for (const i in this.doOptimizedSizes) {
        if (this.doOptimizedSizes[i].slug === doSize) {
          gb = this.doOptimizedSizes[i].memory / 1024;
          cpu = this.doOptimizedSizes[i].vcpus;
        }
      }
      if (cpu && gb) {
        return gb + ' GB RAM, ' + cpu + ' CPUs';
      } else {
        return '';
      }
    }
  }

  public goToStep(step: number): void {
    WizardActions.goToStep(step);
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }
}
