import { User } from '../types';

export class App {
  private container: HTMLElement;
  
  constructor(container: HTMLElement) {
    this.container = container;
  }

  public render(): void {
    // Example user data
    const user: User = {
      id: 1,
      name: "Felipe",
      email: "felipe@consensualfun.com"
    };

    this.container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12">
        <h1 class="text-4xl font-bold text-blue-600 mb-8">
          Transcendence shitty template!
        </h1>
        
        <div class="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
          <h2 class="text-2xl font-semibold mb-4">Welcome!</h2>
          <p class="text-gray-700 mb-4">
            Welcome to Transcendence and give us your information!
          </p>
          
          <div class="bg-gray-100 p-4 rounded-md">
            <h3 class="text-lg font-medium mb-2">Example User Data:</h3>
            <ul class="text-gray-700">
              <li><span class="font-medium">ID:</span> ${user.id}</li>
              <li><span class="font-medium">Name:</span> ${user.name}</li>
              <li><span class="font-medium">Email:</span> ${user.email}</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }
}