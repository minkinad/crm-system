// Deal status enum used for sales pipeline tracking.
export enum DealStage {
  LEAD = 'Lead',
  QUALIFIED = 'Qualified',
  PROPOSAL = 'Proposal',
  NEGOTIATION = 'Negotiation',
  WON = 'Won',
  LOST = 'Lost'
}

// Priority-like state for forecast logic.
export enum DealStatus {
  OPEN = 'Open',
  WON = 'Won',
  LOST = 'Lost'
}
