namespace App{
  export enum ProjectStatus { Active, Finished }

  // project Type
  // 항상 동일한 구조를 갖는 프로젝트 객체 구축을 하기 위한 project의 type을 설정
  export class Project {
    constructor(
      public id: string,
      public title: string,
      public description: string,
      public people: number,
      public status: ProjectStatus,
    ) {

    }
  }
}
