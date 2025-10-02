// src/services/StorageService.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_ALUNOS = "@mealv:alunos";
const KEY_ADM = "@mealv:adm";

const StorageService = {
  async getAllAlunos() {
    try {
      const raw = await AsyncStorage.getItem(KEY_ALUNOS);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error("StorageService.getAllAlunos", err);
      return [];
    }
  },

  async saveAlunos(list = []) {
    try {
      await AsyncStorage.setItem(KEY_ALUNOS, JSON.stringify(list));
      return true;
    } catch (err) {
      console.error("StorageService.saveAlunos", err);
      throw err;
    }
  },

  async getAlunoByMatricula(matricula) {
    try {
      const list = await StorageService.getAllAlunos();
      return list.find(a => String(a.matricula) === String(matricula)) || null;
    } catch (err) {
      console.error("StorageService.getAlunoByMatricula", err);
      return null;
    }
  },

  async updateAluno(updatedAluno) {
    try {
      const list = await StorageService.getAllAlunos();
      const idx = list.findIndex(a => String(a.matricula) === String(updatedAluno.matricula));
      if (idx >= 0) list[idx] = updatedAluno;
      else list.push(updatedAluno);
      await StorageService.saveAlunos(list);
      return updatedAluno;
    } catch (err) {
      console.error("StorageService.updateAluno", err);
      throw err;
    }
  },

  async getAdm() {
    try {
      const raw = await AsyncStorage.getItem(KEY_ADM);
      return raw ? JSON.parse(raw) : { password: "admin123" };
    } catch (err) {
      console.error("StorageService.getAdm", err);
      return { password: "admin123" };
    }
  },

  async validateTicket(code) {
    try {
      const list = await StorageService.getAllAlunos();
      const found = list.find(a => a.ticketCode === code);
      if (!found) return { ok: false, reason: "Ticket não encontrado" };
      return { ok: true, aluno: found };
    } catch (err) {
      console.error("StorageService.validateTicket", err);
      return { ok: false, reason: "Erro ao validar" };
    }
  },

  async markTicketUsed(matricula, code) {
    try {
      const aluno = await StorageService.getAlunoByMatricula(matricula);
      if (!aluno) return null;
      if (aluno.ticketCode !== code) return null;
      const updated = { ...aluno, ticketStatus: "usado" };
      await StorageService.updateAluno(updated);
      return updated;
    } catch (err) {
      console.error("StorageService.markTicketUsed", err);
      return null;
    }
  },
};

export default StorageService;
