// This service is no longer in use and its contents have been removed to resolve errors.

export const initDB = (): Promise<boolean> => {
  console.warn('initDB is deprecated');
  return Promise.resolve(true);
};

export const saveConsultation = (plan: any): Promise<void> => {
  console.warn('saveConsultation is deprecated', plan);
  return Promise.resolve();
};

export const getAllSavedConsultations = (): Promise<any[]> => {
  console.warn('getAllSavedConsultations is deprecated');
  return Promise.resolve([]);
};

export const deleteConsultation = (id: string): Promise<void> => {
  console.warn('deleteConsultation is deprecated', id);
  return Promise.resolve();
};
