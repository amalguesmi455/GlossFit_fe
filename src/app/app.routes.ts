import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SigninComponent } from './signin/signin.component';
import { DressingComponent } from './dressing/dressing.component';
import { ProfilFashionistaComponent } from './profil-fashionista/profil-fashionista.component';
import { ProfilStylisteComponent } from './profil-styliste/profil-styliste.component';
import { SignupComponent } from './signup/signup.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { CreateProfileFashionistaComponent } from './create-profile-fashionista/create-profile-fashionista.component';
import { CreateProfileStylisteComponent } from './create-profile-styliste/create-profile-styliste.component';
import { AdminDashbordComponent } from './admin-dashbord/admin-dashbord.component';
import { StylingRequestComponent } from './styling-request/styling-request.component';
import { FeedComponent } from './feed/feed.component';
import { SettingsComponent } from './settings/settings.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

export const routes: Routes = [

        { path: '', component: LandingPageComponent },
        { path: 'signin', component: SigninComponent },
        { path: 'signup', component: SignupComponent },
        { path: 'reset-password', component: ResetPasswordComponent },
        { path: 'verify-email', component: VerifyEmailComponent },
        { path: 'dressing', component: DressingComponent },
        { path: 'styling', component: StylingRequestComponent },
        { path: 'styling-request', component: StylingRequestComponent },
        { path: 'home', component: HomeComponent },
        { path: 'profilestyliste', component: ProfilStylisteComponent },
        { path: 'profilestyliste/:id', component: ProfilStylisteComponent },
        { path: 'profilestyliste/:id/dressing', component: DressingComponent },
        { path: 'profilefashionista', component: ProfilFashionistaComponent },
        { path: 'profilefashionista/:id', component: ProfilFashionistaComponent },
        { path: 'createprofilefashionista/:id', component: CreateProfileFashionistaComponent },
        { path: 'createprofilestyliste/:id', component: CreateProfileStylisteComponent },
        { path: 'adminDashbord', component: AdminDashbordComponent },
        { path: 'settings', component: SettingsComponent },
        {path: 'feed', component:FeedComponent},

];
