export type Member = {
  id: string;
  username: string;
  role: 'admin' | 'user';
}

export type Group = {
  id: number;
  name: string;
  color: string;
  icon: string;
  members: Member[];
}

export type GroupModel = {
  id: number;
  name: string;
}