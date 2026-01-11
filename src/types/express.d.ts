// This tells TypeScript to merge with the global Express namespace
declare global {
  namespace Express {
    // This adds properties to the existing User interface
    interface User {
      email: string;
      name: string;
    }

    interface Request {
      authUser: {
        id: string;
        username: string;
        email: string;
        password?: string;
        avatar?: string | null;
        createdAt?: Date;
        updatedAt?: Date;
      };
    }
  }
}

// This is required for the file to be treated as a module
export {};
