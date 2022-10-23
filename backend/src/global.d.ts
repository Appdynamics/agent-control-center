import "express"; // Modifies global namespace, so include it!

declare global {
  // namespace Express {
  //   interface Request {
  //     token: string;
  //     UserID: string;
  //   }
  // }

  /* Global variables follow. They *must* use var to work.
        and cannot be initialized here. */

  // eslint-disable-next-line no-var
  var ACCESS_TOKEN: string;
  var mongoConnection: any;
}

export {};
