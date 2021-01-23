export interface IClassesLoader {

  getClasses(topic: string): Function[];

  getClassesWithFilter(topic: string, excludeFilter?: (className: string, modulName: string) => boolean): Function[];
}
