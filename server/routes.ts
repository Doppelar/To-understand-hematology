import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertNodeSchema, insertEdgeSchema, insertSocietySchema, insertConferenceSchema, insertSocietyOfficialSchema } from "@shared/schema";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Object storage routes for public file uploading
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error accessing object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  });

  app.put("/api/photos", async (req, res) => {
    if (!req.body.photoURL) {
      return res.status(400).json({ error: "photoURL is required" });
    }
    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = objectStorageService.normalizeObjectEntityPath(req.body.photoURL);
      res.status(200).json({ objectPath });
    } catch (error) {
      console.error("Error setting photo:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Nodes API
  app.get("/api/nodes", async (req, res) => {
    try {
      const nodes = await storage.getAllNodes();
      res.json(nodes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch nodes" });
    }
  });

  app.get("/api/nodes/:id", async (req, res) => {
    try {
      const node = await storage.getNode(req.params.id);
      if (!node) {
        return res.status(404).json({ error: "Node not found" });
      }
      res.json(node);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch node" });
    }
  });

  app.post("/api/nodes", async (req, res) => {
    try {
      const data = insertNodeSchema.parse(req.body);
      const node = await storage.createNode(data);
      res.status(201).json(node);
    } catch (error) {
      res.status(400).json({ error: "Invalid node data" });
    }
  });

  app.patch("/api/nodes/:id", async (req, res) => {
    try {
      const node = await storage.updateNode(req.params.id, req.body);
      if (!node) {
        return res.status(404).json({ error: "Node not found" });
      }
      res.json(node);
    } catch (error) {
      res.status(400).json({ error: "Failed to update node" });
    }
  });

  app.delete("/api/nodes/:id", async (req, res) => {
    try {
      const success = await storage.deleteNode(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Node not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete node" });
    }
  });

  // Edges API
  app.get("/api/edges", async (req, res) => {
    try {
      const edges = await storage.getAllEdges();
      res.json(edges);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch edges" });
    }
  });

  app.post("/api/edges", async (req, res) => {
    try {
      const data = insertEdgeSchema.parse(req.body);
      const edge = await storage.createEdge(data);
      res.status(201).json(edge);
    } catch (error) {
      res.status(400).json({ error: "Invalid edge data" });
    }
  });

  app.patch("/api/edges/:id", async (req, res) => {
    try {
      const edge = await storage.updateEdge(req.params.id, req.body);
      if (!edge) {
        return res.status(404).json({ error: "Edge not found" });
      }
      res.json(edge);
    } catch (error) {
      res.status(400).json({ error: "Failed to update edge" });
    }
  });

  app.delete("/api/edges/:id", async (req, res) => {
    try {
      const success = await storage.deleteEdge(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Edge not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete edge" });
    }
  });

  // Societies API
  app.get("/api/societies", async (req, res) => {
    try {
      const societies = await storage.getAllSocieties();
      res.json(societies);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch societies" });
    }
  });

  app.get("/api/societies/:id", async (req, res) => {
    try {
      const society = await storage.getSociety(req.params.id);
      if (!society) {
        return res.status(404).json({ error: "Society not found" });
      }
      res.json(society);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch society" });
    }
  });

  app.post("/api/societies", async (req, res) => {
    try {
      const data = insertSocietySchema.parse(req.body);
      const society = await storage.createSociety(data);
      res.status(201).json(society);
    } catch (error) {
      res.status(400).json({ error: "Invalid society data" });
    }
  });

  app.patch("/api/societies/:id", async (req, res) => {
    try {
      const society = await storage.updateSociety(req.params.id, req.body);
      if (!society) {
        return res.status(404).json({ error: "Society not found" });
      }
      res.json(society);
    } catch (error) {
      res.status(400).json({ error: "Failed to update society" });
    }
  });

  app.delete("/api/societies/:id", async (req, res) => {
    try {
      const success = await storage.deleteSociety(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Society not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete society" });
    }
  });

  // Conferences API
  app.get("/api/conferences", async (req, res) => {
    try {
      const conferences = await storage.getAllConferences();
      res.json(conferences);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conferences" });
    }
  });

  app.get("/api/conferences/society/:societyId", async (req, res) => {
    try {
      const conferences = await storage.getConferencesBySociety(req.params.societyId);
      res.json(conferences);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conferences" });
    }
  });

  app.post("/api/conferences", async (req, res) => {
    try {
      const data = insertConferenceSchema.parse(req.body);
      const conference = await storage.createConference(data);
      res.status(201).json(conference);
    } catch (error) {
      res.status(400).json({ error: "Invalid conference data" });
    }
  });

  app.patch("/api/conferences/:id", async (req, res) => {
    try {
      const conference = await storage.updateConference(req.params.id, req.body);
      if (!conference) {
        return res.status(404).json({ error: "Conference not found" });
      }
      res.json(conference);
    } catch (error) {
      res.status(400).json({ error: "Failed to update conference" });
    }
  });

  app.delete("/api/conferences/:id", async (req, res) => {
    try {
      const success = await storage.deleteConference(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Conference not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete conference" });
    }
  });

  // Society Officials API
  app.get("/api/society-officials", async (req, res) => {
    try {
      const officials = await storage.getAllSocietyOfficials();
      res.json(officials);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch society officials" });
    }
  });

  app.get("/api/society-officials/society/:societyId", async (req, res) => {
    try {
      const officials = await storage.getSocietyOfficialsBySociety(req.params.societyId);
      res.json(officials);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch society officials" });
    }
  });

  app.post("/api/society-officials", async (req, res) => {
    try {
      const data = insertSocietyOfficialSchema.parse(req.body);
      const official = await storage.createSocietyOfficial(data);
      res.status(201).json(official);
    } catch (error) {
      res.status(400).json({ error: "Invalid society official data" });
    }
  });

  app.delete("/api/society-officials/:id", async (req, res) => {
    try {
      const success = await storage.deleteSocietyOfficial(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Society official not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete society official" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
