import {NodeProvider} from '../model/NodeProviderConstants';
import {AWSDatacenterSpec} from './datacenter/AWSDatacenterSpec';
import {AzureDatacenterSpec} from './datacenter/AzureDatacenterSpec';
import {BringYourOwnDatacenterSpec} from './datacenter/BringYourOwnDatacenterSpec';
import {DigitaloceanDatacenterSpec} from './datacenter/DigitaloceanDatacenterSpec';
import {HetznerDatacenterSpec} from './datacenter/HetznerDatacenterSpec';
import {OpenStackDatacenterSpec} from './datacenter/OpenStackDatacenterSpec';
import {VSphereDatacenterSpec} from './datacenter/VSphereDatacenterSpec';
import {MetadataEntity} from './MetadataEntity';

export class DataCenterEntity {
  metadata: MetadataEntity;
  spec: DatacenterSpec;
  seed: boolean;

  static sortByName(a: DataCenterEntity, b: DataCenterEntity): number {
    const nameA = a.metadata.name.toLowerCase;
    const nameB = b.metadata.name.toLowerCase;

    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }

    // names must be equal
    return 0;
  }
}

export class DatacenterSpec {
  seed: string;
  country: string;
  location: string;
  provider: string;

  digitalocean?: DigitaloceanDatacenterSpec;
  bringyourown?: BringYourOwnDatacenterSpec;
  aws?: AWSDatacenterSpec;
  openstack?: OpenStackDatacenterSpec;
  vsphere?: VSphereDatacenterSpec;
  hetzner?: HetznerDatacenterSpec;
  azure?: AzureDatacenterSpec;
}

export class DatacenterOperatingSystemOptions {
  coreos: string;
  centos: string;
  ubuntu: string;
}

export function getDatacenterProvider(datacenter: DataCenterEntity): string {
  switch (true) {
    case !!datacenter.spec.digitalocean: {
      return NodeProvider.DIGITALOCEAN;
    }
    case !!datacenter.spec.aws: {
      return NodeProvider.AWS;
    }
    case !!datacenter.spec.bringyourown: {
      return NodeProvider.BRINGYOUROWN;
    }
    case !!datacenter.spec.openstack: {
      return NodeProvider.OPENSTACK;
    }
    case !!datacenter.spec.vsphere: {
      return NodeProvider.VSPHERE;
    }
    case !!datacenter.spec.hetzner: {
      return NodeProvider.HETZNER;
    }
    case !!datacenter.spec.azure: {
      return NodeProvider.AZURE;
    }
  }
  return '';
}
