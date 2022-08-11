///<reference path="base-component.ts" />
///<reference path="../decorator/autoBind.ts" />
///<reference path="../state/project-state.ts" />
///<reference path="../model/drag-drop.ts" />

namespace App {
  //프로젝트 리스트 관리
  export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
    assignedProjects: Project[];

    constructor(private type: 'active' | 'finished') {
      // this.type 이 아닌 이유는 super가 끝나기전에는 this.xx를 사용할 수 없음. 하지만 매개변수를 사용할 수 있어서 type으로만 명시함
      super('project-list', 'app', false, `${type}-projects`);
      this.assignedProjects = [];

      this.configure();
      this.renderContent();
    }

    @AutoBind
    dragOverHandler(event: DragEvent) {
      if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
        // drag 가능한 항목이 아니면 이벤트 막기
        event.preventDefault();

        // 드롭가능한 장소로 이동이 됬을 때, 배경색 처리
        const listEl = this.element.querySelector('ul')!;
        listEl.classList.add('droppable');
      }
    }

    @AutoBind
    dropHandler(event: DragEvent) {
      // console.log(event.dataTransfer!.getData('text/plain'));
      const prjId = event.dataTransfer!.getData('text/plain');
      projectState.moveProject(prjId, this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished)
    }

    @AutoBind
    dragLeaveHandler(_: DragEvent) {
      // 드롭가능한 장소에서 떠났을 때, 배경색 처리
      const listEl = this.element.querySelector('ul')!;
      listEl.classList.remove('droppable');
    }

    configure(): void {
      this.element.addEventListener('dragover', this.dragOverHandler)
      this.element.addEventListener('dragleave', this.dragLeaveHandler)
      this.element.addEventListener('drop', this.dropHandler)

      projectState.addListener((projects: Project[]) => {
        const relevantProjects = projects.filter(prj => {
          if (this.type === 'active') {
            return prj.status === ProjectStatus.Active;
          }
          return prj.status === ProjectStatus.Finished;
        });

        this.assignedProjects = relevantProjects;
        this.renderProjects();
      })
    }

    // 타입스크립트의 추상 method는 private를 지원하지 않는다.
    renderContent() {
      const listId = `${this.type}-projects-list`;
      this.element.querySelector('ul')!.id = listId;
      this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';

    }

    private renderProjects() {
      const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
      // 모든 항목을 초기화한 다음 모든 항목 다시 추가
      listEl.innerHTML = '';
      for (const prjItem of this.assignedProjects) {
        new ProjectItem(this.element.querySelector('ul')!.id, prjItem)
      }
    }
  }

}