import { FieldVisibility, defaultFieldVisibility } from "@shared/schema";

export interface IStorage {
  getFieldVisibility(): Promise<FieldVisibility>;
  updateFieldVisibility(settings: FieldVisibility): Promise<FieldVisibility>;
}

export class MemStorage implements IStorage {
  private fieldVisibility: FieldVisibility;

  constructor() {
    this.fieldVisibility = { ...defaultFieldVisibility };
  }

  async getFieldVisibility(): Promise<FieldVisibility> {
    return { ...this.fieldVisibility };
  }

  async updateFieldVisibility(settings: FieldVisibility): Promise<FieldVisibility> {
    this.fieldVisibility = { ...settings };
    return { ...this.fieldVisibility };
  }
}

export const storage = new MemStorage();
