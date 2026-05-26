import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SigninComponent } from './signin/signin.component';
import { DressingComponent } from './dressing/dressing.component';
import { ProfilFashionistaComponent } from './profil-fashionista/profil-fashionista.component';
import { ProfilStylisteComponent } from './profil-styliste/profil-styliste.component';
import { SignupComponent } from './signup/signup.component';
import { DemandComponent } from './demand/demand.component';
import { LandingPageComponent } from './landing-page/landing-page.component';

export const routes: Routes = [

        { path: '', component: LandingPageComponent },
        { path: 'signin', component: SigninComponent },
        { path: 'signup', component: SignupComponent },
        { path:'dressing',component: DressingComponent },
        { path:'demand',component: DemandComponent },
        {path:'home',component: HomeComponent},
        {path:'profilestyliste/',component: ProfilStylisteComponent},
        {path:'profilestyliste/:id/dressing',component: DressingComponent},
        { path: 'profilefashionista', component: ProfilFashionistaComponent },
        { path: 'profilefashionista/:id/dressing', component: DressingComponent },


];
