export class AppService {
  getHello(): { message: string } {
    return { message: 'Welcome to the API' };
  }

  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
    };
  }
}
