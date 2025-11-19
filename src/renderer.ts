export {};

declare global {
  interface Window {
    electron: {
      fetchUrl: (url: string) => Promise<{ success: boolean; data?: string; error?: string }>;
    };
  }
}

const func = async (): Promise<void> => {
  const result = await window.electron.fetchUrl('https://www.google.com');
  console.log(result?.data ?? 'Empty response');
};

func();