
import express from "express";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";

async function startServer() {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });
  const PORT = 3000;

  app.use(express.json());

  // In-memory "Database" for demo purposes
  const users: any[] = [];
  
  // Pre-populate with default admin for demo
  const adminPassword = await bcrypt.hash("password123", 10);
  users.push({
    id: "USR-ADMIN",
    name: "Dr. Alpha Bah (Admin)",
    email: "admin@gov.sl",
    password: adminPassword,
    role: "ADMIN",
    district: "Western Area Urban",
    status: "Active",
    joinedAt: new Date().toISOString()
  });

  const resetCodes = new Map<string, { code: string, expires: number }>();
  const sentEmails: Array<{ to: string, subject: string, body: string, timestamp: string }> = [];

  // Email Transporter Setup
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const sendRealEmail = async (to: string, subject: string, body: string, htmlBody?: string) => {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("[EMAIL] SMTP not configured. Falling back to log-only.");
      return false;
    }

    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"Outbreak Alert SL" <noreply@health.sl>',
        to,
        subject,
        text: body,
        html: htmlBody || `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #2563eb;">Outbreak Alert SL</h2>
                <p>${body}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #666;">This is an automated message from the National Health Surveillance Network of Sierra Leone.</p>
              </div>`,
      });
      return true;
    } catch (error) {
      console.error("[EMAIL] Error sending email:", error);
      return false;
    }
  };

  // Auth Routes
  app.post("/api/auth/signup", async (req, res) => {
    const { name, email, password, role, district, staffId, facilityName } = req.body;
    
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: `USR-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      name,
      email,
      password: hashedPassword,
      role,
      district,
      staffId,
      facilityName,
      status: "Active",
      joinedAt: new Date().toISOString()
    };

    users.push(newUser);
    const { password: _, ...userWithoutPassword } = newUser;
    res.json(userWithoutPassword);
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);

    if (!user) {
      return res.status(401).json({ error: "invalid email address" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ error: "invalid password" });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    resetCodes.set(email, { code, expires: Date.now() + 600000 }); // 10 mins

    const subject = "Your Outbreak Alert SL Reset Code";
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const verificationLink = `${appUrl}/auth?mode=verify&email=${encodeURIComponent(email)}&code=${code}`;
    
    const body = `Your password reset code is: ${code}. It expires in 10 minutes. Or click here to verify automatically: ${verificationLink}`;

    const emailLog = {
      to: email,
      subject,
      body,
      timestamp: new Date().toISOString()
    };
    sentEmails.push(emailLog);

    console.log(`[AUTH] Reset code for ${email}: ${code}`);
    
    const htmlBody = `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px; margin: auto;">
        <h2 style="color: #2563eb; margin-bottom: 20px;">Outbreak Alert SL</h2>
        <p style="font-size: 16px; color: #333;">Your password reset code is:</p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #1e293b;">${code}</span>
        </div>
        <p style="font-size: 14px; color: #666; margin-bottom: 24px;">Or click the button below to verify automatically:</p>
        <a href="${verificationLink}" style="display: block; background: #2563eb; color: white; text-decoration: none; padding: 16px; border-radius: 12px; text-align: center; font-weight: bold; font-size: 14px;">Verify & Reset Password</a>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 11px; color: #999; text-align: center;">This code expires in 10 minutes. If you didn't request this, please ignore this email.</p>
      </div>
    `;

    const sent = await sendRealEmail(email, subject, body, htmlBody);
    
    res.json({ 
      message: sent ? "Reset code sent to your email" : "Reset code generated (SMTP not configured)", 
      demoCode: code,
      realEmailSent: sent
    });
  });

  app.post("/api/auth/verify-code", (req, res) => {
    const { email, code } = req.body;
    const entry = resetCodes.get(email);

    if (entry && entry.code === code && entry.expires > Date.now()) {
      res.json({ message: "Code verified" });
    } else {
      res.status(400).json({ error: "Invalid or expired code" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    
    console.log(`[AUTH] Password reset for ${email}`);
    resetCodes.delete(email);
    res.json({ message: "Password reset successfully" });
  });

  // Admin and System Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", users: users.length, uptime: process.uptime() });
  });

  app.get("/api/admin/emails", (req, res) => {
    res.json(sentEmails);
  });

  app.get("/api/admin/users", (req, res) => {
    res.json(users.map(({ password, ...u }) => u));
  });

  // Mock data generators for real-time feed
  const diseases = ["Ebola", "Cholera", "Lassa Fever", "Malaria", "Yellow Fever"];
  const districts = ["Western Area Urban", "Kenema", "Bo", "Bombali", "Kailahun", "Kono"];

  const generateDiseaseUpdate = () => ({
    id: Math.random().toString(36).substr(2, 9),
    title: "New Disease Signal",
    message: `A potential cluster of ${diseases[Math.floor(Math.random() * diseases.length)]} has been reported in ${districts[Math.floor(Math.random() * districts.length)]}.`,
    type: "DISEASE_UPDATE",
    timestamp: new Date().toISOString(),
    readBy: []
  });

  const generateSystemVitals = () => ({
    type: "SYSTEM_VITALS",
    stability: (99 + Math.random()).toFixed(2),
    latency: Math.floor(30 + Math.random() * 20),
    activeUsers: users.length + Math.floor(Math.random() * 10),
    timestamp: new Date().toISOString()
  });

  wss.on("connection", (ws) => {
    console.log("Client connected to WebSocket");
    
    // Send initial welcome message
    ws.send(JSON.stringify({ type: "SYSTEM", message: "Connected to National Health Surveillance Feed" }));

    // Send periodic updates
    const diseaseInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(generateDiseaseUpdate()));
      }
    }, 20000); // Every 20 seconds

    const vitalsInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(generateSystemVitals()));
      }
    }, 5000); // Every 5 seconds

    ws.on("close", () => {
      clearInterval(diseaseInterval);
      clearInterval(vitalsInterval);
      console.log("Client disconnected");
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    // SPA fallback for production
    app.get("*", (req, res) => {
      res.sendFile("index.html", { root: "dist" });
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
