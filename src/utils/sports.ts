import {
  PiBasketball,
  PiPersonSimpleRun,
  PiSoccerBall,
  PiSpinnerBall,
  PiTennisBall,
  PiVolleyball,
} from "react-icons/pi";

export type Sport =
  | "futebol"
  | "basquete"
  | "volei"
  | "tenis"
  | "futsal"
  | "corrida";

export const getSportColor = (sport: Sport) => {
  const colors: { [key in Sport]: string } = {
    futebol:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    basquete:
      "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
    volei: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    tenis:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
    futsal:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100",
    corrida: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  };
  return colors[sport] || "bg-gray-100 text-gray-800";
};

export const getSportIconById = (id: Sport) => {
  switch (id) {
    case "futebol":
      return PiSoccerBall;
    case "futsal":
      return PiSpinnerBall;
    case "volei":
      return PiVolleyball;
    case "basquete":
      return PiBasketball;
    case "tenis":
      return PiTennisBall;
    case "corrida":
      return PiPersonSimpleRun;
    default:
      return PiSoccerBall;
  }
};

export const sportOptions: { id: Sport; name: string }[] = [
  { id: "futebol", name: "Futebol" },
  { id: "futsal", name: "Futsal" },
  { id: "volei", name: "Vôlei" },
  { id: "basquete", name: "Basquete" },
  { id: "tenis", name: "Tênis" },
  { id: "corrida", name: "Corrida" },
];

const sportLabels: { [key in Sport]: string } = {
  futebol: "Futebol",
  basquete: "Basquete",
  volei: "Vôlei",
  tenis: "Tênis",
  futsal: "Futsal",
  corrida: "Corrida",
};

export const getSportLabelById = (id: string) => {
  return sportLabels[id as Sport] || "Desconhecido";
};

export const sportsIds = sportOptions.map((option) => option.id);
