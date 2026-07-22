import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({selector:'app-home',standalone:true,imports:[CommonModule,FormsModule,RouterModule],templateUrl:'./home.component.html',styleUrls:['./home.component.css']})
export class HomeComponent {
  botOpen=false; message='';
  conversation=[
    {who:'bot',text:'¡Hola! Soy AEL_BOT 0.1, una representación digital curada del perfil de Ael.'},
    {who:'bot',text:'Puedes preguntarme por sus proyectos, habilidades, intereses, forma de trabajar o gustos. Escribe “ayuda” si prefieres comandos.'}
  ];
  constructor(private router:Router){}

  @HostListener('document:keydown',['$event']) shortcut(event:KeyboardEvent){
    const target=event.target as HTMLElement;
    if(event.key==='/'&&!['INPUT','TEXTAREA'].includes(target.tagName)){event.preventDefault();this.openBot();}
    if(event.key==='Escape')this.botOpen=false;
  }
  openBot(){this.botOpen=true;setTimeout(()=>document.querySelector<HTMLInputElement>('.bot-input')?.focus());}
  ask(suggestion?:string){
    const raw=(suggestion??this.message).trim(); if(!raw)return;
    this.conversation.push({who:'you',text:raw}); this.message='';
    const q=raw.toLocaleLowerCase('es'); let answer='No tengo ese dato en mi pequeña base local todavía. Puedes preguntarme por proyectos, habilidades, ciberseguridad, educación, gustos o contacto.';
    if(/ayuda|help|comando/.test(q)) answer='Prueba: “¿Qué sabe hacer Ael?”, “¿Qué proyecto debería ver?”, “¿Qué le interesa?”, “¿Cómo trabaja?” o “contacto”. También entiendo: projects, skills, about y clear.';
    else if(/clear|limpiar/.test(q)){this.conversation=[];return;}
    else if(/habilidad|skills|tecnolog|stack|sabe hacer/.test(q)) answer='Ael trabaja con Angular, TypeScript, interfaces responsive y APIs del navegador. Sus proyectos exploran voz, lógica de juegos, experiencias educativas, cifrado y ciberseguridad.';
    else if(/proyecto|projects|ver primero|recomienda/.test(q)) answer='Si buscas seguridad, empieza por Cyber CTF y Cipher Terminal. Para APIs del navegador, visita Lector Mágico. Para lógica y estado, prueba Batalla Naval o Snake.';
    else if(/gust|inter|apasion|hobby/.test(q)) answer='Le interesan Linux, explorar sistemas, la estética web antigua, crear herramientas educativas, la ciberseguridad y las ideas que conectan a las personas.';
    else if(/trabaja|forma de|personalidad|fortaleza/.test(q)) answer='Su perfil combina curiosidad técnica y vocación educativa: le gusta desarmar problemas, experimentar y convertir lo aprendido en algo que otras personas puedan usar.';
    else if(/quien|quién|about|sobre ael/.test(q)) answer='Ael es desarrolladora, educadora y exploradora digital chilena. Está orientando su camino hacia la ciberseguridad y el desarrollo de aplicaciones con propósito.';
    else if(/contact|contratar|correo|email/.test(q)) answer='Puedes conocer más y encontrar las vías de contacto en PROFILE.EXE. La abriré para ti…';
    else if(/hola|buenas|hey/.test(q)) answer='¡Hola, visitante! Bienvenid@ al rincón de Ael en la World Wide Web. ¿Quieres conocer sus proyectos o su perfil?';
    this.conversation.push({who:'bot',text:answer});
    if(/contact|contratar|correo|email/.test(q))setTimeout(()=>this.router.navigate(['/about']),900);
    setTimeout(()=>{const box=document.querySelector('.bot-log');if(box)box.scrollTop=box.scrollHeight;});
  }
}
