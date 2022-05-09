interface IShow {
  id: number,
  name: string,
  summary?: string,
  image?: IImage

};

interface IEpisode{
  id: number,
  name: string,
  season: number,
  number: number
}

interface IProgram {
  show: IShow
}

interface IImage{
  medium: string
}
//ISHOWAPI



export {IShow, IEpisode, IProgram}
