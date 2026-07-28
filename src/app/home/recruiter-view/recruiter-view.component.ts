import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  QueryList,
  ViewChildren
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BotService } from '../../service/bot.service';

type RecruiterSection = 'profile' | 'projects' | 'stack' | 'trajectory' | 'contact';
type RecruiterQuestion = 'hire' | 'spring' | 'education' | 'projects';

interface RecruiterProject {
  id: 'kuichi-web' | 'patota' | 'kuichi-app';
  chapter: string;
  name: string;
  category: string;
  summary: string;
  problem: string;
  contribution: string;
  role: string;
  techs: string[];
  demoUrl: string;
  architectureModal: string;
}

interface RecruiterMessage {
  sender: 'user' | 'bot';
  text: string;
}

interface RecruiterWheelStop {
  targetId: string;
  section: RecruiterSection;
}

@Component({
  selector: 'app-recruiter-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './recruiter-view.component.html',
  styleUrls: ['./recruiter-view.component.css']
})
export class RecruiterViewComponent implements AfterViewInit, OnDestroy {
  @ViewChildren('trackedSection') trackedSections?: QueryList<ElementRef<HTMLElement>>;

  readonly sections: Array<{ id: RecruiterSection; label: string; shortLabel: string }> = [
    { id: 'profile', label: 'Perfil', shortLabel: '01' },
    { id: 'projects', label: 'Mapa de proyectos', shortLabel: '02' },
    { id: 'stack', label: 'Tecnologías', shortLabel: '03' },
    { id: 'trajectory', label: 'Trayectoria', shortLabel: '04' },
    { id: 'contact', label: 'Contacto', shortLabel: '05' }
  ];

  readonly wheelStops: RecruiterWheelStop[] = [
    { targetId: 'recruiter-profile', section: 'profile' },
    { targetId: 'recruiter-projects', section: 'projects' },
    { targetId: 'recruiter-projects-dossier', section: 'projects' },
    { targetId: 'recruiter-stack', section: 'stack' },
    { targetId: 'recruiter-stack-more', section: 'stack' },
    { targetId: 'recruiter-trajectory', section: 'trajectory' },
    { targetId: 'recruiter-trajectory-more', section: 'trajectory' },
    { targetId: 'recruiter-contact', section: 'contact' }
  ];

  readonly sectionPageCounts: Record<RecruiterSection, number> = {
    profile: 1,
    projects: 2,
    stack: 2,
    trajectory: 2,
    contact: 1
  };

  readonly projects: RecruiterProject[] = [
    {
      id: 'kuichi-web',
      chapter: 'CAPÍTULO 01',
      name: 'Kuichi Web',
      category: 'VET PLATFORM · WEB',
      summary: 'Plataforma web para cuidar mascotas y conectar a sus dueños con servicios veterinarios, registros médicos y ofertas.',
      problem: 'Reunir en una misma experiencia el cuidado, el historial y el acceso a servicios para mascotas.',
      contribution: 'Sistema web que conecta servicios veterinarios, registros médicos y ofertas en una experiencia integrada.',
      role: 'Desarrollo de aplicación web',
      techs: ['Java', 'Spring Boot', 'Angular', 'REST API'],
      demoUrl: 'https://aelstgermain.github.io/kuichiweb/',
      architectureModal: '#kuichiWebModal'
    },
    {
      id: 'patota',
      chapter: 'CAPÍTULO 02',
      name: 'Patota',
      category: 'COMMUNITY · WEB APP',
      summary: 'Aplicación para convocar grupos de personas y coordinar paseos o actividades al aire libre.',
      problem: 'Facilitar la convocatoria y coordinación de personas para rutas y actividades recreativas.',
      contribution: 'Una experiencia web ligera para organizar salidas y mantener la información del grupo en un mismo lugar.',
      role: 'Diseño y desarrollo web',
      techs: ['JavaScript', 'HTML5/CSS3', 'Web App', 'UX/UI'],
      demoUrl: 'https://aelstgermain.github.io/Patota',
      architectureModal: '#patotaModal'
    },
    {
      id: 'kuichi-app',
      chapter: 'CAPÍTULO 03',
      name: 'Kuichi App',
      category: 'MOBILE · HYBRID APP',
      summary: 'Versión móvil de Kuichi con servicios, promociones veterinarias y seguimiento desde el smartphone.',
      problem: 'Llevar las funciones principales de Kuichi a una experiencia móvil accesible.',
      contribution: 'Aplicación híbrida multiplataforma para consultar servicios y alertas relacionadas con el cuidado de mascotas.',
      role: 'Desarrollo móvil híbrido',
      techs: ['Ionic', 'Angular', 'TypeScript', 'Mobile'],
      demoUrl: 'https://aelstgermain.github.io/kuichiapp',
      architectureModal: '#kuichiAppModal'
    }
  ];

  readonly stackGroups = [
    {
      code: 'SYS.01',
      title: 'Backend & arquitectura',
      description: 'Servicios, lógica de negocio, seguridad y persistencia.',
      skills: ['Java', 'Spring Boot', 'Spring MVC', 'REST APIs', 'Spring Security', 'JPA / Hibernate', 'Node.js', 'Express.js']
    },
    {
      code: 'SYS.02',
      title: 'Datos & integración',
      description: 'Modelado relacional, consultas, validación y flujos de datos.',
      skills: ['PostgreSQL', 'MySQL', 'SQL', 'H2', 'Supabase', 'Firebase', 'Master Data']
    },
    {
      code: 'SYS.03',
      title: 'Web & móvil',
      description: 'Interfaces conectadas al backend y adaptadas a distintos dispositivos.',
      skills: ['Angular', 'TypeScript', 'Ionic', 'JavaScript', 'HTML5', 'CSS3', 'Bootstrap']
    },
    {
      code: 'SYS.04',
      title: 'Entrega & colaboración',
      description: 'Herramientas y prácticas para trabajo técnico organizado.',
      skills: ['Git', 'GitHub Actions', 'Docker', 'Linux', 'Maven', 'Scrum', 'Documentación']
    }
  ];

  readonly timeline = [
    {
      marker: 'AHORA',
      meta: 'PRÁCTICA PROFESIONAL',
      title: 'Junior Backend & Data Integration · FollowUP',
      description: 'Desarrollo backend, integración de sistemas, validación de datos operacionales, consultas SQL y documentación dentro de un equipo Scrum.'
    },
    {
      marker: 'EN CURSO',
      meta: 'FORMACIÓN SUPERIOR',
      title: 'Ingeniería Civil Informática',
      description: 'Formación en ciencias de la computación, algoritmos, bases de datos y arquitectura de sistemas.'
    },
    {
      marker: 'TÍTULO',
      meta: 'FORMACIÓN TÉCNICA',
      title: 'Técnico Analista de Sistemas',
      description: 'Base en ciclo de vida de software, programación orientada a objetos, bases de datos y desarrollo de aplicaciones.'
    },
    {
      marker: 'C1',
      meta: 'IDIOMAS',
      title: 'Inglés avanzado',
      description: 'Lectura de documentación técnica y comunicación en contextos tecnológicos.'
    }
  ];

  activeSection: RecruiterSection = 'profile';
  activeSectionPage = 1;
  selectedProject = this.projects[0];
  aiMessages: RecruiterMessage[] = [
    {
      sender: 'bot',
      text: 'Soy AEL_AI. Puedo resumir el perfil, la formación o los proyectos de Sofía.'
    }
  ];
  aiTyping = false;

  private observer?: IntersectionObserver;
  private aiTypeTimer?: ReturnType<typeof setInterval>;
  private wheelUnlockTimer?: ReturnType<typeof setTimeout>;
  private wheelAccumulator = 0;
  private wheelDirection = 0;
  private wheelNavigationLocked = false;
  private currentWheelStopIndex = 0;

  constructor(
    private host: ElementRef<HTMLElement>,
    public botService: BotService
  ) {}

  ngAfterViewInit(): void {
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    const scrollRoot = this.host.nativeElement.querySelector<HTMLElement>('.future-recruiter');

    this.observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        const id = visible?.target.getAttribute('data-section') as RecruiterSection | null;
        if (id) {
          this.activeSection = id;
          if (this.wheelStops[this.currentWheelStopIndex]?.section !== id) {
            this.currentWheelStopIndex = this.firstWheelStopFor(id);
            this.activeSectionPage = 1;
          }
        }
      },
      {
        root: scrollRoot,
        rootMargin: '-18% 0px -58% 0px',
        threshold: [0.08, 0.25, 0.5]
      }
    );

    this.trackedSections?.forEach(section => this.observer?.observe(section.nativeElement));
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (this.aiTypeTimer) {
      clearInterval(this.aiTypeTimer);
    }
    if (this.wheelUnlockTimer) {
      clearTimeout(this.wheelUnlockTimer);
    }
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent): void {
    if (event.ctrlKey || event.deltaY === 0 || this.shouldKeepNativeScroll(event)) {
      return;
    }

    event.preventDefault();

    const direction = Math.sign(event.deltaY);
    if (direction !== this.wheelDirection) {
      this.wheelAccumulator = 0;
      this.wheelDirection = direction;
    }

    this.wheelAccumulator += event.deltaY;

    if (this.wheelNavigationLocked || Math.abs(this.wheelAccumulator) < 12) {
      return;
    }

    const currentIndex = this.currentWheelStopIndex;
    const nextIndex = Math.min(
      this.wheelStops.length - 1,
      Math.max(0, currentIndex + direction)
    );

    this.wheelAccumulator = 0;

    if (nextIndex === currentIndex) {
      return;
    }

    const destination = this.wheelStops[nextIndex];
    const target = this.host.nativeElement.querySelector<HTMLElement>(`#${destination.targetId}`);
    const reducedMotion = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.wheelNavigationLocked = true;
    this.currentWheelStopIndex = nextIndex;
    this.activeSection = destination.section;
    this.activeSectionPage = this.pageForWheelStop(nextIndex);
    target?.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'start'
    });

    this.wheelUnlockTimer = setTimeout(() => {
      this.wheelNavigationLocked = false;
      this.wheelDirection = 0;
      this.wheelAccumulator = 0;
    }, reducedMotion ? 120 : 850);
  }

  navigateTo(event: Event, section: RecruiterSection): void {
    event.preventDefault();
    const target = this.host.nativeElement.querySelector<HTMLElement>(`#recruiter-${section}`);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.currentWheelStopIndex = this.firstWheelStopFor(section);
    this.activeSection = section;
    this.activeSectionPage = 1;
  }

  selectProject(project: RecruiterProject): void {
    this.selectedProject = project;
  }

  showPersonalView(): void {
    this.botService.toggleRecruiterMode();
  }

  askRecruiterAi(topic: RecruiterQuestion): void {
    if (this.aiTyping) {
      return;
    }

    const questions: Record<RecruiterQuestion, string> = {
      hire: '¿Qué aporta Sofía a un equipo?',
      spring: '¿Cuál es su experiencia con Java y Spring?',
      education: '¿Cuál es su formación?',
      projects: '¿Qué proyectos puedo revisar?'
    };

    const responses: Record<RecruiterQuestion, string> = {
      hire: 'Aporta una base backend con Java, Spring Boot y SQL, experiencia de integración y datos, documentación técnica y habilidades transferibles desde el sector educativo.',
      spring: 'Su stack incluye Java, Spring Boot, Spring MVC, Spring Security, JPA/Hibernate y diseño de APIs REST conectadas a bases de datos relacionales.',
      education: 'Es Técnico Analista de Sistemas, estudia Ingeniería Civil Informática y cuenta con inglés avanzado C1.',
      projects: 'Puedes revisar Kuichi Web, Patota y Kuichi App. Las tres demos están enlazadas en el mapa de proyectos.'
    };

    this.aiMessages.push({ sender: 'user', text: questions[topic] });
    this.aiTyping = true;

    setTimeout(() => {
      const messageIndex = this.aiMessages.push({ sender: 'bot', text: '' }) - 1;
      this.typeAiAnswer(responses[topic], messageIndex);
    }, 240);
  }

  private typeAiAnswer(answer: string, messageIndex: number): void {
    let character = 0;
    if (this.aiTypeTimer) {
      clearInterval(this.aiTypeTimer);
    }

    this.aiTypeTimer = setInterval(() => {
      if (character < answer.length) {
        this.aiMessages[messageIndex].text += answer.charAt(character);
        character++;
        this.scrollAiLog();
        return;
      }

      this.aiTyping = false;
      if (this.aiTypeTimer) {
        clearInterval(this.aiTypeTimer);
      }
    }, 10);
  }

  private scrollAiLog(): void {
    setTimeout(() => {
      const log = this.host.nativeElement.querySelector<HTMLElement>('.recruiter-ai-log');
      if (log) {
        log.scrollTop = log.scrollHeight;
      }
    });
  }

  private shouldKeepNativeScroll(event: WheelEvent): boolean {
    const target = event.target;
    if (typeof Element === 'undefined' || !(target instanceof Element)) {
      return false;
    }

    if (target.closest('.modal')) {
      return true;
    }

    const nestedScroller = target.closest<HTMLElement>('.recruiter-ai-log');
    if (!nestedScroller) {
      return false;
    }

    const scrollingDown = event.deltaY > 0;
    const canScrollDown =
      nestedScroller.scrollTop + nestedScroller.clientHeight < nestedScroller.scrollHeight - 1;
    const canScrollUp = nestedScroller.scrollTop > 0;

    return scrollingDown ? canScrollDown : canScrollUp;
  }

  private firstWheelStopFor(section: RecruiterSection): number {
    const index = this.wheelStops.findIndex(stop => stop.section === section);
    return index === -1 ? 0 : index;
  }

  private pageForWheelStop(stopIndex: number): number {
    const section = this.wheelStops[stopIndex].section;
    return this.wheelStops
      .slice(0, stopIndex + 1)
      .filter(stop => stop.section === section)
      .length;
  }
}
