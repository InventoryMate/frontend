import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrediccionDemandaComponent } from './prediccion-demanda.component';

describe('PrediccionDemandaComponent', () => {
  let component: PrediccionDemandaComponent;
  let fixture: ComponentFixture<PrediccionDemandaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrediccionDemandaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrediccionDemandaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
