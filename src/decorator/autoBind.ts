namespace App{

  // autobind 데코레이터
  export function AutoBind(_target: any, _method: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
      configurable: true,
      get() {
        const boundFn = originalMethod.bind(this);
        return boundFn;
      }
    }
    return adjDescriptor;
  }

}