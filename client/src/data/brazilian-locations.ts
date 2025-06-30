// Estados e cidades do Brasil
export interface State {
  code: string;
  name: string;
  cities: string[];
}

export const brazilianStates: State[] = [
  {
    code: "SP",
    name: "São Paulo",
    cities: [
      "São Paulo", "Guarulhos", "Campinas", "São Bernardo do Campo", "Santo André",
      "Osasco", "Ribeirão Preto", "Sorocaba", "Mauá", "São José dos Campos",
      "Mogi das Cruzes", "Diadema", "Jundiaí", "Piracicaba", "Carapicuíba",
      "Bauru", "São Vicente", "Franca", "Itaquaquecetuba", "Guarujá",
      "Taubaté", "Praia Grande", "Limeira", "Suzano", "Taboão da Serra",
      "Sumaré", "Barueri", "Embu das Artes", "São Carlos", "Marília"
    ]
  },
  {
    code: "MG",
    name: "Minas Gerais", 
    cities: [
      "Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim",
      "Montes Claros", "Ribeirão das Neves", "Uberaba", "Governador Valadares", "Ipatinga",
      "Sete Lagoas", "Divinópolis", "Santa Luzia", "Ibirité", "Poços de Caldas"
    ]
  },
  {
    code: "RJ",
    name: "Rio de Janeiro",
    cities: [
      "Rio de Janeiro", "São Gonçalo", "Duque de Caxias", "Nova Iguaçu", "Niterói",
      "Belford Roxo", "São João de Meriti", "Campos dos Goytacazes", "Petrópolis", "Volta Redonda"
    ]
  },
  {
    code: "BA",
    name: "Bahia",
    cities: [
      "Salvador", "Feira de Santana", "Vitória da Conquista", "Camaçari", "Juazeiro",
      "Petrolina", "Lauro de Freitas", "Itabuna", "Jequié", "Teixeira de Freitas"
    ]
  },
  {
    code: "RS",
    name: "Rio Grande do Sul",
    cities: [
      "Porto Alegre", "Caxias do Sul", "Pelotas", "Canoas", "Santa Maria",
      "Gravataí", "Viamão", "Novo Hamburgo", "São Leopoldo", "Rio Grande"
    ]
  },
  {
    code: "PR",
    name: "Paraná",
    cities: [
      "Curitiba", "Londrina", "Maringá", "Ponta Grossa", "Cascavel",
      "São José dos Pinhais", "Foz do Iguaçu", "Colombo", "Guarapuava", "Paranaguá"
    ]
  },
  {
    code: "CE",
    name: "Ceará",
    cities: [
      "Fortaleza", "Caucaia", "Juazeiro do Norte", "Maracanaú", "Sobral",
      "Crato", "Itapipoca", "Maranguape", "Iguatu", "Quixadá"
    ]
  },
  {
    code: "SC",
    name: "Santa Catarina",
    cities: [
      "Joinville", "Florianópolis", "Blumenau", "São José", "Criciúma",
      "Chapecó", "Itajaí", "Lages", "Jaraguá do Sul", "Palhoça"
    ]
  },
  {
    code: "GO",
    name: "Goiás",
    cities: [
      "Goiânia", "Aparecida de Goiânia", "Anápolis", "Rio Verde", "Luziânia",
      "Águas Lindas de Goiás", "Valparaíso de Goiás", "Trindade", "Formosa", "Novo Gama"
    ]
  },
  {
    code: "MT",
    name: "Mato Grosso",
    cities: [
      "Cuiabá", "Várzea Grande", "Rondonópolis", "Sinop", "Tangará da Serra",
      "Cáceres", "Sorriso", "Lucas do Rio Verde", "Barra do Garças", "Primavera do Leste"
    ]
  }
];

export const getStateByCode = (code: string): State | undefined => {
  return brazilianStates.find(state => state.code === code);
};

export const getCitiesByState = (stateCode: string): string[] => {
  const state = getStateByCode(stateCode);
  return state ? state.cities : [];
};