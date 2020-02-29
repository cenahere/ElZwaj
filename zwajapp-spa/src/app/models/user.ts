import { Photo } from './Photo';

export interface User {
        id : number;
        userName : string;
          gender : string; 
          dateOfBirth : Date; 
          knownAs : string; 
          created  : Date;
          lastActive : Date; 
          introduction : string; 
          lookingFor : string; 
          interests : string; 
          city : string; 
          country : string;
          age:number;
          photoUrl:string; 
          photos : Photo[]; 

          roles?:string[];
}
