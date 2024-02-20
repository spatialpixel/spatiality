
class ProjectsList extends HTMLElement {
  constructor () {
    super();

    const template = document.getElementById('projects-list-template');
    const templateContent = template.content;
    
    // Create shadow DOM and append template
    this.attachShadow({ mode: 'open' });

    this.shadowRoot.appendChild(templateContent.cloneNode(true));
  }
  
  populate (state) {
    const list = this.shadowRoot.querySelector('.projects');
    for (const project of state.projects) {
      const item = document.createElement('button');

      item.classList.add('project');
      item.id = project.id;
      item.innerText = project.name;
      
      item.addEventListener('click', event => {
        console.log(`Opening project ${project.name} ${project.id}`);
        
        state.openProject(project.id, projectObj => {
          const projectNameInput = document.getElementById('project-name-input');
          projectNameInput.value = projectObj.name;
        });
      });

      list.appendChild(item);
    }
  }
  
  updateProjectName (projectId, newName) {
    const projectListItem = this.shadowRoot.getElementById(projectId);
    projectListItem.innerText = newName;
  }
}

// Define the custom element
customElements.define('projects-list', ProjectsList);
