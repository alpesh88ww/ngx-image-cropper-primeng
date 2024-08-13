import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Import this for animations
import { importProvidersFrom } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';


bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideAnimations() // Add this to enable animations
  ],
}).catch(err => console.error(err));
