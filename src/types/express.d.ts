declare namespace Express {
  interface Request {
    userId: string
    traceId: string
  }
}