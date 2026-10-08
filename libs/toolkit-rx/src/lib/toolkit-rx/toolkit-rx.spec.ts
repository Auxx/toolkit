import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToolkitRx } from './toolkit-rx';

describe('ToolkitRx', () => {
  let component: ToolkitRx;
  let fixture: ComponentFixture<ToolkitRx>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ToolkitRx ]
    }).compileComponents();

    fixture = TestBed.createComponent(ToolkitRx);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
