import { Routes } from '@angular/router';
import { PedidosComponent } from './components/pedidos/pedidos.component';
import { ProductosComponent } from './components/productos/productos.component';
import { PrediccionDemandaComponent } from './components/prediccion-demanda/prediccion-demanda.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { StockComponent } from './components/productos/stock/stock.component';
import { PedidoDetalleComponent } from './components/pedidos/detalle/detalle.component';
import { HomeComponent } from './components/home/home.component';


export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'productos', component: ProductosComponent },
  { path: 'pedidos', component: PedidosComponent },
  { path: 'pedidos/:pedidoId', component: PedidoDetalleComponent },
  { path: 'prediccion', component: PrediccionDemandaComponent },
  { path: 'productos/:productId/stocks', component: StockComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Redirige al login por defecto
  { path: '**', redirectTo: 'login' }, // Redirige a login para rutas no encontradas
];
