// Vitrine de cursos do site oficial (Lito Aviation Academy). Aparecem
// bloqueados no catálogo, com CTA "Adquirir curso agora" que leva à compra
// no site oficial. Não há checkout interno.

export interface ShowcaseCourse {
  title: string;
  subtitle: string;
  url: string;
  image: string;
}

const CDN = "https://litoaviationacademy.com.br/wp-content/uploads";

export const SHOWCASE_COURSES: ShowcaseCourse[] = [
  {
    title: "Mecânico de Aeronaves Básico + Célula",
    subtitle: "Formação",
    url: "https://litoaviationacademy.com.br/formacoes-e-cursos/curso-mecanico-de-aeronaves/",
    image: `${CDN}/2025/03/Mecanico.jpg`,
  },
  {
    title: "Mecânico de Aeronaves Básico + Célula + Aviônica + GMP",
    subtitle: "Formação completa",
    url: "https://litoaviationacademy.com.br/formacoes-e-cursos/mecanico-de-aeronaves-basico-celula-avionica-gmp/",
    image: `${CDN}/2025/03/MMA-Thumbs-Site-LitoAviation-Academy-2.png`,
  },
  {
    title: "Mecânico de Aeronaves Básico + GMP",
    subtitle: "Formação",
    url: "https://litoaviationacademy.com.br/formacoes-e-cursos/mecanico-de-aeronaves-basico-gmp/",
    image: `${CDN}/2025/03/MMA-Thumbs-Site-LitoAviation-Academy-avionica-gmp.png`,
  },
  {
    title: "Mecânico de Aeronaves Básico + Aviônica",
    subtitle: "Formação",
    url: "https://litoaviationacademy.com.br/formacoes-e-cursos/mecanico-de-aeronaves-basico-avionica/",
    image: `${CDN}/2025/03/MMA-Thumbs-Site-LitoAviation-Academy-avionica.png`,
  },
  {
    title: "Preparatório FAA para Mecânicos",
    subtitle: "Curso de manutenção",
    url: "https://litoaviationacademy.com.br/formacoes-e-cursos/preparatorio-faa-para-mecanicos/",
    image: `${CDN}/2025/11/WhatsApp-Image-2026-05-07-at-16.18.01.jpeg`,
  },
  {
    title: "Iniciação ao Airbus A320 para Mecânicos",
    subtitle: "Curso de manutenção",
    url: "https://litoaviationacademy.com.br/formacoes-e-cursos/iniciacao-ao-airbus-a320-para-mecanicos/",
    image: `${CDN}/2025/11/Cursos-Livres-Thumbs-Site-LitoAviation-Academy-6.png`,
  },
  {
    title: "Iniciação Boeing 737 para Mecânicos",
    subtitle: "Curso de manutenção",
    url: "https://litoaviationacademy.com.br/formacoes-e-cursos/boeing_737_mecanicos/",
    image: `${CDN}/2025/11/Cursos-Livres-Thumbs-Site-LitoAviation-Academy-9.png`,
  },
];
