import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidoDetalleComponent } from './detalle.component';

describe('NuevoComponent', () => {
  let component: PedidoDetalleComponent;
  let fixture: ComponentFixture<PedidoDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PedidoDetalleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PedidoDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
