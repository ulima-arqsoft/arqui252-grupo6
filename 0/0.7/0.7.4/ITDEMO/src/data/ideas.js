const ideas = [
  {
    "ideaId": "idea_101",
    "title": "Asistente educativo con IA",
    "tags": [
      "IA",
      "Educación"
    ],
    "author": "María Pérez"
  },
  {
    "ideaId": "idea_102",
    "title": "Sistema solar inteligente IoT",
    "tags": [
      "Energía",
      "IoT"
    ],
    "author": "Luis Ramos"
  },
  {
    "ideaId": "idea_103",
    "title": "Detector de estrés con IA",
    "tags": [
      "IA",
      "Salud"
    ],
    "author": "Ana Torres"
  },
  {
    "ideaId": "idea_104",
    "title": "App de reciclaje comunitario",
    "tags": [
      "Sostenibilidad",
      "Comunidad"
    ],
    "author": "Carlos Vega"
  },
  {
    "ideaId": "idea_105",
    "title": "Sistema de monitoreo agrícola con drones",
    "tags": [
      "Agricultura",
      "IoT"
    ],
    "author": "Elena García"
  },
  {
    "ideaId": "idea_106",
    "title": "Chatbot legal gratuito",
    "tags": [
      "IA",
      "LegalTech"
    ],
    "author": "Miguel Ortega"
  },
  {
    "ideaId": "idea_107",
    "title": "Detector de fugas en edificios inteligentes",
    "tags": [
      "IoT",
      "Energía"
    ],
    "author": "Valeria Núñez"
  },
  {
    "ideaId": "idea_108",
    "title": "Sistema de predicción de tráfico urbano",
    "tags": [
      "IA",
      "Transporte"
    ],
    "author": "Raúl Méndez"
  },
  {
    "ideaId": "idea_109",
    "title": "Plataforma de intercambio de libros",
    "tags": [
      "Educación",
      "Comunidad"
    ],
    "author": "Lucía Soto"
  },
  {
    "ideaId": "idea_110",
    "title": "Monitor de salud materna IoT",
    "tags": [
      "Salud",
      "IoT"
    ],
    "author": "Carmen Silva"
  },
  {
    "ideaId": "idea_111",
    "title": "Sistema de optimización de riego agrícola",
    "tags": [
      "Agricultura",
      "Energía",
      "IoT"
    ],
    "author": "Daniel Ruiz"
  },
  {
    "ideaId": "idea_112",
    "title": "App de voluntariado local",
    "tags": [
      "Comunidad",
      "Sostenibilidad"
    ],
    "author": "Paola Jiménez"
  },
  {
    "ideaId": "idea_113",
    "title": "Asistente de estudio con IA",
    "tags": [
      "IA",
      "Educación"
    ],
    "author": "David Soto"
  },
  {
    "ideaId": "idea_114",
    "title": "Gestor de gastos personales inteligente",
    "tags": [
      "Finanzas",
      "IA"
    ],
    "author": "Rocío León"
  },
  {
    "ideaId": "idea_115",
    "title": "Red social para makers e inventores",
    "tags": [
      "Comunidad",
      "Innovación"
    ],
    "author": "Pedro Alarcón"
  },
  {
    "ideaId": "idea_116",
    "title": "Control de iluminación por voz",
    "tags": [
      "IoT",
      "SmartHome"
    ],
    "author": "Sofía Ramos"
  },
  {
    "ideaId": "idea_117",
    "title": "Plataforma de trueque digital",
    "tags": [
      "Blockchain",
      "Comunidad"
    ],
    "author": "Héctor Valdez"
  },
  {
    "ideaId": "idea_118",
    "title": "Detección temprana de incendios forestales",
    "tags": [
      "IA",
      "Sostenibilidad"
    ],
    "author": "Natalia Torres"
  },
  {
    "ideaId": "idea_119",
    "title": "Seguimiento de envíos por blockchain",
    "tags": [
      "Blockchain",
      "Logística"
    ],
    "author": "Carlos Herrera"
  },
  {
    "ideaId": "idea_120",
    "title": "Asistente de salud mental virtual",
    "tags": [
      "IA",
      "Salud"
    ],
    "author": "Beatriz Flores"
  },
  {
    "ideaId": "idea_121",
    "title": "Simulador de energía renovable",
    "tags": [
      "Educación",
      "Energía"
    ],
    "author": "Andrés Rojas"
  },
  {
    "ideaId": "idea_122",
    "title": "Plataforma de mentorías en línea",
    "tags": [
      "Educación",
      "Comunidad"
    ],
    "author": "Fernanda Díaz"
  },
  {
    "ideaId": "idea_123",
    "title": "Optimización de rutas de entrega urbana",
    "tags": [
      "IA",
      "Logística"
    ],
    "author": "Mario Paredes"
  },
  {
    "ideaId": "idea_124",
    "title": "Sensores para medir calidad del aire",
    "tags": [
      "IoT",
      "Sostenibilidad"
    ],
    "author": "Andrea Salas"
  },
  {
    "ideaId": "idea_125",
    "title": "Sistema de tutorías entre estudiantes",
    "tags": [
      "Educación",
      "Comunidad"
    ],
    "author": "José Aguilar"
  },
  {
    "ideaId": "idea_104",
    "title": "Plataforma de reciclaje colaborativo",
    "tags": [
      "Sostenibilidad",
      "Educación"
    ],
    "author": "Carlos Vega"
  }
]

export function setLocalIdeas() {
  if (!localStorage.getItem("ideas")) {
    localStorage.setItem("ideas", JSON.stringify(ideas));
    localStorage.setItem("ideaTagIndex", JSON.stringify({}));
  }
}
