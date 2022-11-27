export interface INpmlsOptions {
  filter?: (packageJson: any) => boolean
  depth: number
  level?: number
  subModulePaths?: string[],

  /**
   * Glob pattern to exclude some directories.
   */
  exclude?: string[];

  /**
   * Glob pattern to include some directories.
   */
  include?: string[];


  /**
   * Options for micromatch dirname pattern match
   */
  matcherOptions?: any;
}
