// src/services/StorageService.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../config/appConfig";

const KEYS = {
  ALUNOS: "@app:alunos",
  TICKETS: "@app:tickets",
  ADM: "@app:adm"
};

async function read(key) {
  const s = await AsyncStorage.getItem(key);
  return s ? JSON.parse(s) : null;
}
async function write(key, value) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export default {
  async getAlunos() {
    return (await read(KEYS.ALUNOS)) || [];
  },
  async addAluno(aluno) {
    const list = await this.getAlunos();
    if (list.find(a => String(a.matricula) === String(aluno.matricula))) throw new Error("Matrícula já cadastrada");
    list.push(aluno);
    await write(KEYS.ALUNOS, list);
    return aluno;
  },
  async getAlunoByMatricula(matricula) {
    const list = await this.getAlunos();
    return list.find(a => String(a.matricula) === String(matricula)) || null;
  },

  async getTickets() {
    return (await read(KEYS.TICKETS)) || [];
  },
  async addTicket(ticket) {
    const list = await this.getTickets();
    if (list.find(t => t.idTicket === ticket.idTicket)) throw new Error("Ticket já existe");
    list.push(ticket);
    await write(KEYS.TICKETS, list);
    return ticket;
  },
  async updateTicket(updated) {
    const list = await this.getTickets();
    const next = list.map(t => (t.idTicket === updated.idTicket ? updated : t));
    await write(KEYS.TICKETS, next);
    return updated;
  },
  async getTicketsByDate(dateISO) {
    const all = await this.getTickets();
    return all.filter(t => t.dateISO === dateISO);
  },
  async getTicketForMatriculaOnDate(matricula, dateISO) {
    const all = await this.getTickets();
    return all.find(t => String(t.matricula) === String(matricula) && t.dateISO === dateISO) || null;
  },
  async resetTicketsForDate(dateISO) {
    const all = await this.getTickets();
    const next = all.filter(t => t.dateISO !== dateISO);
    await write(KEYS.TICKETS, next);
    return next;
  },

  async getAdm() {
    return (await read(KEYS.ADM)) || { password: "admin123" };
  },
  async setAdm(adm) {
    await write(KEYS.ADM, adm);
    return adm;
  },

  getTurmas() {
    return Array.isArray(config.turmas) ? config.turmas : [];
  },
  getTurmaById(id) {
    try {
      const turmas = Array.isArray(config.turmas) ? config.turmas : [];
      return turmas.find(t => String(t.id) === String(id)) || null;
    } catch (err){
      console.warn("StorageService.getTurmaById error:", err);
      return null;
    }
  },

  async clearAll() {
    await AsyncStorage.clear();
  }
};
