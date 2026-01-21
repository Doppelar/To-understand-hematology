import { 
  type Node, 
  type InsertNode, 
  type Edge, 
  type InsertEdge,
  type Society,
  type InsertSociety,
  type Conference,
  type InsertConference,
  type SocietyOfficial,
  type InsertSocietyOfficial,
  type CartFacility,
  type InsertCartFacility,
  nodes,
  edges,
  societies,
  conferences,
  societyOfficials,
  cartFacilities
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getNode(id: string): Promise<Node | undefined>;
  getAllNodes(): Promise<Node[]>;
  createNode(node: InsertNode): Promise<Node>;
  updateNode(id: string, node: Partial<InsertNode>): Promise<Node | undefined>;
  deleteNode(id: string): Promise<boolean>;
  
  getEdge(id: string): Promise<Edge | undefined>;
  getAllEdges(): Promise<Edge[]>;
  createEdge(edge: InsertEdge): Promise<Edge>;
  updateEdge(id: string, edge: Partial<InsertEdge>): Promise<Edge | undefined>;
  deleteEdge(id: string): Promise<boolean>;

  getSociety(id: string): Promise<Society | undefined>;
  getAllSocieties(): Promise<Society[]>;
  createSociety(society: InsertSociety): Promise<Society>;
  updateSociety(id: string, society: Partial<InsertSociety>): Promise<Society | undefined>;
  deleteSociety(id: string): Promise<boolean>;

  getConference(id: string): Promise<Conference | undefined>;
  getAllConferences(): Promise<Conference[]>;
  getConferencesBySociety(societyId: string): Promise<Conference[]>;
  createConference(conference: InsertConference): Promise<Conference>;
  updateConference(id: string, conference: Partial<InsertConference>): Promise<Conference | undefined>;
  deleteConference(id: string): Promise<boolean>;

  getSocietyOfficial(id: string): Promise<SocietyOfficial | undefined>;
  getAllSocietyOfficials(): Promise<SocietyOfficial[]>;
  getSocietyOfficialsBySociety(societyId: string): Promise<SocietyOfficial[]>;
  createSocietyOfficial(official: InsertSocietyOfficial): Promise<SocietyOfficial>;
  updateSocietyOfficial(id: string, official: Partial<InsertSocietyOfficial>): Promise<SocietyOfficial | undefined>;
  deleteSocietyOfficial(id: string): Promise<boolean>;

  getCartFacility(id: string): Promise<CartFacility | undefined>;
  getAllCartFacilities(): Promise<CartFacility[]>;
  createCartFacility(facility: InsertCartFacility): Promise<CartFacility>;
  updateCartFacility(id: string, facility: Partial<InsertCartFacility>): Promise<CartFacility | undefined>;
  deleteCartFacility(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private nodes: Map<string, Node>;
  private edges: Map<string, Edge>;
  private societies: Map<string, Society>;
  private conferences: Map<string, Conference>;
  private societyOfficials: Map<string, SocietyOfficial>;
  private cartFacilitiesMap: Map<string, CartFacility>;

  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
    this.societies = new Map();
    this.conferences = new Map();
    this.societyOfficials = new Map();
    this.cartFacilitiesMap = new Map();
  }

  async getNode(id: string): Promise<Node | undefined> {
    return this.nodes.get(id);
  }

  async getAllNodes(): Promise<Node[]> {
    return Array.from(this.nodes.values());
  }

  async createNode(insertNode: InsertNode): Promise<Node> {
    const id = randomUUID();
    const node: Node = { 
      id,
      name: insertNode.name,
      facilityName: insertNode.facilityName ?? null,
      position: insertNode.position ?? null,
      career: insertNode.career ?? null,
      specialty: insertNode.specialty ?? null,
      region: insertNode.region ?? null,
      photoUrl: insertNode.photoUrl ?? null,
      graduationUniversity: insertNode.graduationUniversity ?? null,
      graduationYear: insertNode.graduationYear ?? null,
      appointmentDate: insertNode.appointmentDate ?? null,
      retirementDate: insertNode.retirementDate ?? null,
      positionX: "0",
      positionY: "0"
    };
    this.nodes.set(id, node);
    return node;
  }

  async updateNode(id: string, updates: Partial<InsertNode>): Promise<Node | undefined> {
    const node = this.nodes.get(id);
    if (!node) return undefined;
    
    const updatedNode = { ...node, ...updates };
    this.nodes.set(id, updatedNode);
    return updatedNode;
  }

  async deleteNode(id: string): Promise<boolean> {
    return this.nodes.delete(id);
  }

  async getEdge(id: string): Promise<Edge | undefined> {
    return this.edges.get(id);
  }

  async getAllEdges(): Promise<Edge[]> {
    return Array.from(this.edges.values());
  }

  async createEdge(insertEdge: InsertEdge): Promise<Edge> {
    const id = randomUUID();
    const edge: Edge = { 
      id,
      sourceId: insertEdge.sourceId,
      targetId: insertEdge.targetId,
      label: insertEdge.label ?? null,
      direction: insertEdge.direction ?? 'forward'
    };
    this.edges.set(id, edge);
    return edge;
  }

  async updateEdge(id: string, updates: Partial<InsertEdge>): Promise<Edge | undefined> {
    const edge = this.edges.get(id);
    if (!edge) return undefined;
    const updated: Edge = { ...edge, ...updates };
    this.edges.set(id, updated);
    return updated;
  }

  async deleteEdge(id: string): Promise<boolean> {
    return this.edges.delete(id);
  }

  async getSociety(id: string): Promise<Society | undefined> {
    return this.societies.get(id);
  }

  async getAllSocieties(): Promise<Society[]> {
    return Array.from(this.societies.values());
  }

  async createSociety(insertSociety: InsertSociety): Promise<Society> {
    const id = randomUUID();
    const society: Society = { 
      id,
      name: insertSociety.name,
      shortName: insertSociety.shortName,
      description: insertSociety.description ?? null
    };
    this.societies.set(id, society);
    return society;
  }

  async updateSociety(id: string, updates: Partial<InsertSociety>): Promise<Society | undefined> {
    const society = this.societies.get(id);
    if (!society) return undefined;
    
    const updatedSociety = { ...society, ...updates };
    this.societies.set(id, updatedSociety);
    return updatedSociety;
  }

  async deleteSociety(id: string): Promise<boolean> {
    return this.societies.delete(id);
  }

  async getConference(id: string): Promise<Conference | undefined> {
    return this.conferences.get(id);
  }

  async getAllConferences(): Promise<Conference[]> {
    return Array.from(this.conferences.values());
  }

  async getConferencesBySociety(societyId: string): Promise<Conference[]> {
    return Array.from(this.conferences.values()).filter(c => c.societyId === societyId);
  }

  async createConference(insertConference: InsertConference): Promise<Conference> {
    const id = randomUUID();
    const conference: Conference = { 
      id,
      societyId: insertConference.societyId,
      year: insertConference.year,
      number: insertConference.number ?? null,
      title: insertConference.title,
      theme: insertConference.theme ?? null,
      location: insertConference.location ?? null,
      president: insertConference.president ?? null,
      date: insertConference.date ?? null
    };
    this.conferences.set(id, conference);
    return conference;
  }

  async updateConference(id: string, updates: Partial<InsertConference>): Promise<Conference | undefined> {
    const conference = this.conferences.get(id);
    if (!conference) return undefined;
    
    const updatedConference = { ...conference, ...updates };
    this.conferences.set(id, updatedConference);
    return updatedConference;
  }

  async deleteConference(id: string): Promise<boolean> {
    return this.conferences.delete(id);
  }

  async getSocietyOfficial(id: string): Promise<SocietyOfficial | undefined> {
    return this.societyOfficials.get(id);
  }

  async getAllSocietyOfficials(): Promise<SocietyOfficial[]> {
    return Array.from(this.societyOfficials.values());
  }

  async getSocietyOfficialsBySociety(societyId: string): Promise<SocietyOfficial[]> {
    return Array.from(this.societyOfficials.values()).filter(o => o.societyId === societyId);
  }

  async createSocietyOfficial(insertOfficial: InsertSocietyOfficial): Promise<SocietyOfficial> {
    const id = randomUUID();
    const official: SocietyOfficial = { 
      id,
      societyId: insertOfficial.societyId,
      nodeId: insertOfficial.nodeId,
      position: insertOfficial.position,
      term: insertOfficial.term ?? null,
      institution: insertOfficial.institution ?? null
    };
    this.societyOfficials.set(id, official);
    return official;
  }

  async updateSocietyOfficial(id: string, updates: Partial<InsertSocietyOfficial>): Promise<SocietyOfficial | undefined> {
    const official = this.societyOfficials.get(id);
    if (!official) return undefined;
    
    const updatedOfficial = { ...official, ...updates };
    this.societyOfficials.set(id, updatedOfficial);
    return updatedOfficial;
  }

  async deleteSocietyOfficial(id: string): Promise<boolean> {
    return this.societyOfficials.delete(id);
  }

  async getCartFacility(id: string): Promise<CartFacility | undefined> {
    return this.cartFacilitiesMap.get(id);
  }

  async getAllCartFacilities(): Promise<CartFacility[]> {
    return Array.from(this.cartFacilitiesMap.values());
  }

  async createCartFacility(insertFacility: InsertCartFacility): Promise<CartFacility> {
    const id = randomUUID();
    const facility: CartFacility = {
      id,
      name: insertFacility.name,
      region: insertFacility.region,
      address: insertFacility.address ?? null,
      url: insertFacility.url ?? null,
      axicel: insertFacility.axicel ?? "false",
      tisacel: insertFacility.tisacel ?? "false",
      lisocel: insertFacility.lisocel ?? "false",
      abecma: insertFacility.abecma ?? "false",
      carvykti: insertFacility.carvykti ?? "false",
    };
    this.cartFacilitiesMap.set(id, facility);
    return facility;
  }

  async updateCartFacility(id: string, updates: Partial<InsertCartFacility>): Promise<CartFacility | undefined> {
    const facility = this.cartFacilitiesMap.get(id);
    if (!facility) return undefined;
    const updatedFacility = { ...facility, ...updates };
    this.cartFacilitiesMap.set(id, updatedFacility);
    return updatedFacility;
  }

  async deleteCartFacility(id: string): Promise<boolean> {
    return this.cartFacilitiesMap.delete(id);
  }
}

export class DatabaseStorage implements IStorage {
  async getNode(id: string): Promise<Node | undefined> {
    const [node] = await db.select().from(nodes).where(eq(nodes.id, id));
    return node || undefined;
  }

  async getAllNodes(): Promise<Node[]> {
    return await db.select().from(nodes);
  }

  async createNode(insertNode: InsertNode): Promise<Node> {
    const [node] = await db.insert(nodes).values(insertNode).returning();
    return node;
  }

  async updateNode(id: string, updates: Partial<InsertNode>): Promise<Node | undefined> {
    const [node] = await db.update(nodes).set(updates).where(eq(nodes.id, id)).returning();
    return node || undefined;
  }

  async deleteNode(id: string): Promise<boolean> {
    const result = await db.delete(nodes).where(eq(nodes.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getEdge(id: string): Promise<Edge | undefined> {
    const [edge] = await db.select().from(edges).where(eq(edges.id, id));
    return edge || undefined;
  }

  async getAllEdges(): Promise<Edge[]> {
    return await db.select().from(edges);
  }

  async createEdge(insertEdge: InsertEdge): Promise<Edge> {
    const [edge] = await db.insert(edges).values(insertEdge).returning();
    return edge;
  }

  async updateEdge(id: string, updates: Partial<InsertEdge>): Promise<Edge | undefined> {
    const [edge] = await db.update(edges).set(updates).where(eq(edges.id, id)).returning();
    return edge || undefined;
  }

  async deleteEdge(id: string): Promise<boolean> {
    const result = await db.delete(edges).where(eq(edges.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getSociety(id: string): Promise<Society | undefined> {
    const [society] = await db.select().from(societies).where(eq(societies.id, id));
    return society || undefined;
  }

  async getAllSocieties(): Promise<Society[]> {
    return await db.select().from(societies);
  }

  async createSociety(insertSociety: InsertSociety): Promise<Society> {
    const [society] = await db.insert(societies).values(insertSociety).returning();
    return society;
  }

  async updateSociety(id: string, updates: Partial<InsertSociety>): Promise<Society | undefined> {
    const [society] = await db.update(societies).set(updates).where(eq(societies.id, id)).returning();
    return society || undefined;
  }

  async deleteSociety(id: string): Promise<boolean> {
    const result = await db.delete(societies).where(eq(societies.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getConference(id: string): Promise<Conference | undefined> {
    const [conference] = await db.select().from(conferences).where(eq(conferences.id, id));
    return conference || undefined;
  }

  async getAllConferences(): Promise<Conference[]> {
    return await db.select().from(conferences);
  }

  async getConferencesBySociety(societyId: string): Promise<Conference[]> {
    return await db.select().from(conferences).where(eq(conferences.societyId, societyId));
  }

  async createConference(insertConference: InsertConference): Promise<Conference> {
    const [conference] = await db.insert(conferences).values(insertConference).returning();
    return conference;
  }

  async updateConference(id: string, updates: Partial<InsertConference>): Promise<Conference | undefined> {
    const [conference] = await db.update(conferences).set(updates).where(eq(conferences.id, id)).returning();
    return conference || undefined;
  }

  async deleteConference(id: string): Promise<boolean> {
    const result = await db.delete(conferences).where(eq(conferences.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getSocietyOfficial(id: string): Promise<SocietyOfficial | undefined> {
    const [official] = await db.select().from(societyOfficials).where(eq(societyOfficials.id, id));
    return official || undefined;
  }

  async getAllSocietyOfficials(): Promise<SocietyOfficial[]> {
    return await db.select().from(societyOfficials);
  }

  async getSocietyOfficialsBySociety(societyId: string): Promise<SocietyOfficial[]> {
    return await db.select().from(societyOfficials).where(eq(societyOfficials.societyId, societyId));
  }

  async createSocietyOfficial(insertOfficial: InsertSocietyOfficial): Promise<SocietyOfficial> {
    const [official] = await db.insert(societyOfficials).values(insertOfficial).returning();
    return official;
  }

  async updateSocietyOfficial(id: string, updates: Partial<InsertSocietyOfficial>): Promise<SocietyOfficial | undefined> {
    const [official] = await db.update(societyOfficials).set(updates).where(eq(societyOfficials.id, id)).returning();
    return official || undefined;
  }

  async deleteSocietyOfficial(id: string): Promise<boolean> {
    const result = await db.delete(societyOfficials).where(eq(societyOfficials.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getCartFacility(id: string): Promise<CartFacility | undefined> {
    const [facility] = await db.select().from(cartFacilities).where(eq(cartFacilities.id, id));
    return facility || undefined;
  }

  async getAllCartFacilities(): Promise<CartFacility[]> {
    return await db.select().from(cartFacilities);
  }

  async createCartFacility(insertFacility: InsertCartFacility): Promise<CartFacility> {
    const [facility] = await db.insert(cartFacilities).values(insertFacility).returning();
    return facility;
  }

  async updateCartFacility(id: string, updates: Partial<InsertCartFacility>): Promise<CartFacility | undefined> {
    const [facility] = await db.update(cartFacilities).set(updates).where(eq(cartFacilities.id, id)).returning();
    return facility || undefined;
  }

  async deleteCartFacility(id: string): Promise<boolean> {
    const result = await db.delete(cartFacilities).where(eq(cartFacilities.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
