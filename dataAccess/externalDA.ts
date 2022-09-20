import axios from "axios";

export interface MemberAPI {
  name: string;
  email: string;
  address: { city: string };
}

export interface MovieAPI {
  name: string;
  url: string;
  premiered: Date;
  genres: [string];
}

const getMembers = async (): Promise<MemberAPI[]> => {
  try {
    return (
      await axios.get<MemberAPI[]>("https://jsonplaceholder.typicode.com/users")
    ).data;
  } catch (error) {
    throw "error getting members";
  }
};
const getMoviesAndGanres = async (): Promise<MovieAPI[]> => {
  try {
    return (await axios.get<MovieAPI[]>("https://api.tvmaze.com/shows")).data;
  } catch (error) {
    throw "error getting movies";
  }
};

export default { getMembers, getMoviesAndGanres };
