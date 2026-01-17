import { test as baseTest } from '@playwright/test';
import { LandingPage, SportsPage } from '../page-objects';
import { Menu, BearstoreNavigation, Searchbar, Filter } from '../page-objects/elements';

export interface PageFixtures {
  landingPage: LandingPage;
  sportsPage: SportsPage;
  menu: Menu;
  bearstoreNavigation: BearstoreNavigation;
  searchbar: Searchbar;
  filter: Filter;
  
}

export const pageFixtures = {

  landingPage: async ({ page }: any, use: any) => {
    await use(new LandingPage(page));
  },

  sportsPage: async ({ page }: any, use: any) => {
    await use(new SportsPage(page));
  },
  menu : async ({ page }: any, use: any) => {
    await use(new Menu(page));
  },

  bearstoreNavigation: async ({ page }: any, use: any) => {
    await use(new BearstoreNavigation(page));
  },

  searchbar: async ({ page }: any, use: any) => {
    await use(new Searchbar(page));
  },

  filter: async ({ page }: any, use: any) => {
    await use(new Filter(page));
  },
};
