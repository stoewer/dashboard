import { Router } from '@angular/router';
import { of } from 'rxjs';
import { SharedModule } from './../../shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { SlimLoadingBarModule } from 'ng2-slim-loading-bar';
import { BrowserModule, By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterStub, RouterTestingModule } from './../../testing/router-stubs';
import { MatDialogRefMock } from './../../testing/services/mat-dialog-ref-mock';
import { ApiService } from '../../core/services/api/api.service';
import { ApiMockService } from '../../testing/services/api-mock.service';
import { MatDialogRef } from '@angular/material';
import { MemberDeleteConfirmationComponent } from './member-delete-confirmation.component';
import { fakeProject } from '../../testing/fake-data/project.fake';
import { fakeMember } from '../../testing/fake-data/member.fake';

const modules: any[] = [
  BrowserModule,
  HttpClientModule,
  BrowserAnimationsModule,
  SlimLoadingBarModule.forRoot(),
  RouterTestingModule,
  SharedModule
];

describe('MemberDeleteConfirmationComponent', () => {
  let fixture: ComponentFixture<MemberDeleteConfirmationComponent>;
  let component: MemberDeleteConfirmationComponent;
  let apiService: ApiService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...modules,
      ],
      declarations: [
        MemberDeleteConfirmationComponent
      ],
      providers: [
        { provide: MatDialogRef, useClass: MatDialogRefMock },
        { provide: ApiService, useClass: ApiMockService },
        { provide: Router, useClass: RouterStub },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberDeleteConfirmationComponent);
    component = fixture.componentInstance;

    apiService = fixture.debugElement.injector.get(ApiService);
    router = fixture.debugElement.injector.get(Router);
  });

  it('should create the delete member confirmation cmp', async(() => {
    expect(component).toBeTruthy();
  }));

  it('should call deleteMembers method', fakeAsync(() => {
    component.project = fakeProject();
    component.member = fakeMember();

    fixture.detectChanges();
    const spyDeleteProject = spyOn(apiService, 'deleteMembers').and.returnValue(of(null));

    component.deleteMember();
    tick();

    expect(spyDeleteProject.and.callThrough()).toHaveBeenCalled();
  }));
});