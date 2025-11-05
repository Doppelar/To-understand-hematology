import { type Node, type InsertNode, type Edge, type InsertEdge } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getNode(id: string): Promise<Node | undefined>;
  getAllNodes(): Promise<Node[]>;
  createNode(node: InsertNode): Promise<Node>;
  updateNode(id: string, node: Partial<InsertNode>): Promise<Node | undefined>;
  deleteNode(id: string): Promise<boolean>;
  
  getEdge(id: string): Promise<Edge | undefined>;
  getAllEdges(): Promise<Edge[]>;
  createEdge(edge: InsertEdge): Promise<Edge>;
  deleteEdge(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private nodes: Map<string, Node>;
  private edges: Map<string, Edge>;

  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
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
      career: insertNode.career ?? null,
      specialty: insertNode.specialty ?? null,
      region: insertNode.region ?? null,
      photoUrl: insertNode.photoUrl ?? null,
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
      label: insertEdge.label ?? null
    };
    this.edges.set(id, edge);
    return edge;
  }

  async deleteEdge(id: string): Promise<boolean> {
    return this.edges.delete(id);
  }
}

export const storage = new MemStorage();
