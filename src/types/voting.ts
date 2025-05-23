export interface VotingDetails {
  id: number;
  title: string;
  votingStart: number;
  votingEnd: number;
  registrationEnd: number;
  candidatesCount: number;
  totalVotes: number;
}

export interface Candidate {
  id: number;
  name: string;
  photoUrl: string;
  resume: string;
  vision: string;
  mission: string;
  voteCount: number;
}

export interface Winner {
  id: number;
  name: string;
  voteCount: number;
  photoUrl: string;
}