// Vitrine de cursos do site oficial (Lito Aviation Academy). Aparecem
// bloqueados no catálogo, com CTA "Adquirir curso agora" que leva à compra
// no site oficial. Não há checkout interno.

export interface ShowcaseCourse {
  title: string;
  subtitle: string;
  url: string;
}

export const SHOWCASE_COURSES: ShowcaseCourse[] = [
  {
    title: "Mecânico de Aeronaves Básico + Célula",
    subtitle: "Formação",
    url: "https://litoaviationacademy.com.br/formacoes-e-cursos/curso-mecanico-de-aeronaves/",
  },
  {
    title: "Mecânico de Aeronaves Básico + Célula + Aviônica + GMP",
    subtitle: "Formação completa",
    url: "https://litoaviationacademy.com.br/formacoes-e-cursos/mecanico-de-aeronaves-basico-celula-avionica-gmp/",
  },
  {
    title: "Mecânico de Aeronaves Básico + GMP",
    subtitle: "Formação",
    url: "https://litoaviationacademy.com.br/formacoes-e-cursos/mecanico-de-aeronaves-basico-gmp/",
  },
  {
    title: "Mecânico de Aeronaves Básico + Aviônica",
    subtitle: "Formação",
    url: "https://litoaviationacademy.com.br/formacoes-e-cursos/mecanico-de-aeronaves-basico-avionica/",
  },
  {
    title: "Preparatório FAA para Mecânicos",
    subtitle: "Curso de manutenção",
    url: "https://litoaviationacademy.com.br/formacoes-e-cursos/preparatorio-faa-para-mecanicos/",
  },
  {
    title: "Iniciação ao Airbus A320 para Mecânicos",
    subtitle: "Curso de manutenção",
    url: "https://litoaviationacademy.com.br/formacoes-e-cursos/iniciacao-ao-airbus-a320-para-mecanicos/",
  },
  {
    title: "Iniciação Boeing 737 para Mecânicos",
    subtitle: "Curso de manutenção",
    url: "https://litoaviationacademy.com.br/formacoes-e-cursos/boeing_737_mecanicos/",
  },
];
