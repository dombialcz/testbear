import { BasePage } from "./base.page";


export class LandingPage extends BasePage {
    url = '/';
 
    readonly meetTriplakeButton = this.page.getByRole('link', { name: 'Meet Triplake' })


}