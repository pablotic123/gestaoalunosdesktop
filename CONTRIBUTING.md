# 🤝 Guia de Contribuição

Obrigado por considerar contribuir para o SGE - Sistema de Gestão Escolar! Este documento fornece diretrizes para contribuir com o projeto.

## 📋 Código de Conduta

Ao participar deste projeto, você concorda em manter um ambiente respeitoso e inclusivo para todos. Seja gentil, profissional e construtivo em todas as interações.

## 🚀 Como Contribuir

### 1. Reportar Bugs

Se você encontrou um bug, por favor:

1. Verifique se o bug já não foi reportado nas [Issues](https://github.com/seu-usuario/sge-sistema-gestao-escolar/issues)
2. Se não existir, crie uma nova issue com:
   - Título claro e descritivo
   - Descrição detalhada do problema
   - Passos para reproduzir o bug
   - Comportamento esperado vs. comportamento atual
   - Screenshots (se aplicável)
   - Informações do ambiente (SO, versão do navegador, etc.)

### 2. Sugerir Melhorias

Para sugerir uma nova funcionalidade ou melhoria:

1. Verifique se a sugestão já não existe nas Issues
2. Crie uma nova issue com a tag `enhancement`
3. Descreva claramente:
   - Qual problema a funcionalidade resolve
   - Como você imagina que deveria funcionar
   - Exemplos de uso (se possível)

### 3. Fazer Pull Requests

#### Preparação

1. Fork o repositório
2. Clone seu fork:
   ```bash
   git clone https://github.com/seu-usuario/sge-sistema-gestao-escolar.git
   cd sge-sistema-gestao-escolar
   ```

3. Adicione o repositório original como upstream:
   ```bash
   git remote add upstream https://github.com/original-user/sge-sistema-gestao-escolar.git
   ```

4. Crie uma branch para sua feature:
   ```bash
   git checkout -b feature/minha-feature
   ```

#### Desenvolvimento

1. **Faça suas alterações**
   - Mantenha o código limpo e bem documentado
   - Siga os padrões de código do projeto
   - Adicione testes quando aplicável

2. **Teste suas alterações**
   ```bash
   # Backend
   cd backend
   pytest
   
   # Frontend
   cd frontend
   yarn test
   ```

3. **Commit suas mudanças**
   ```bash
   git add .
   git commit -m "feat: adiciona nova funcionalidade X"
   ```
   
   Use mensagens de commit semânticas:
   - `feat:` - Nova funcionalidade
   - `fix:` - Correção de bug
   - `docs:` - Mudanças na documentação
   - `style:` - Formatação, missing semi colons, etc
   - `refactor:` - Refatoração de código
   - `test:` - Adição ou correção de testes
   - `chore:` - Manutenção e tarefas gerais

4. **Push para seu fork**
   ```bash
   git push origin feature/minha-feature
   ```

5. **Abra um Pull Request**
   - Vá para o repositório original no GitHub
   - Clique em "Pull Request"
   - Descreva suas mudanças claramente
   - Referencie issues relacionadas (ex: "Closes #123")

## 💻 Padrões de Código

### Backend (Python/FastAPI)

- Siga a [PEP 8](https://pep8.org/)
- Use type hints
- Documente funções com docstrings
- Mantenha funções pequenas e focadas

```python
from typing import List, Optional

async def get_students(
    turma_id: Optional[str] = None,
    status: Optional[str] = None
) -> List[dict]:
    """
    Busca alunos com filtros opcionais.
    
    Args:
        turma_id: ID da turma para filtrar
        status: Status do aluno (active, inactive, graduated)
    
    Returns:
        Lista de alunos encontrados
    """
    # Implementação...
```

### Frontend (React/JavaScript)

- Use componentes funcionais com hooks
- Siga o padrão do ESLint configurado
- Use nomes descritivos para variáveis e funções
- Extraia lógica complexa em custom hooks

```javascript
// Bom
const [students, setStudents] = useState([]);
const { user, logout } = useAuth();

// Evite
const [s, setS] = useState([]);
const { u, l } = useAuth();
```

### Estrutura de Pastas

Mantenha a organização:

```
backend/
  routes/       # Rotas da API
  models.py     # Modelos Pydantic
  auth.py       # Autenticação

frontend/
  src/
    components/ # Componentes reutilizáveis
    pages/      # Páginas da aplicação
    contexts/   # React Contexts
    utils/      # Utilitários
```

## 🧪 Testes

- Adicione testes para novas funcionalidades
- Mantenha cobertura de testes acima de 80%
- Teste edge cases e cenários de erro

```python
# Backend - pytest
def test_create_student():
    response = client.post("/api/students", json=student_data)
    assert response.status_code == 201
    assert response.json()["name"] == student_data["name"]
```

```javascript
// Frontend - Jest/React Testing Library
test('renders student name', () => {
  render(<StudentCard student={mockStudent} />);
  expect(screen.getByText('João Silva')).toBeInTheDocument();
});
```

## 📝 Documentação

- Atualize o README.md se necessário
- Documente novas APIs no código
- Adicione comentários para lógica complexa
- Mantenha a documentação atualizada

## ✅ Checklist do Pull Request

Antes de submeter, certifique-se de que:

- [ ] O código segue os padrões do projeto
- [ ] Os testes passam localmente
- [ ] Adicionei testes para novas funcionalidades
- [ ] Atualizei a documentação
- [ ] Meu commit está bem descrito
- [ ] Não há conflitos com a branch main

## 🔍 Processo de Review

1. Um mantenedor irá revisar seu PR
2. Pode haver solicitações de mudanças
3. Faça as alterações solicitadas
4. O PR será merged após aprovação

## 🎯 Prioridades

Áreas que mais precisam de ajuda:

- 🐛 Correção de bugs
- 📝 Melhoria da documentação
- ✨ Novas funcionalidades do roadmap
- 🧪 Aumento da cobertura de testes
- 🌐 Internacionalização (i18n)
- ♿ Melhorias de acessibilidade

## 💬 Dúvidas?

Se tiver dúvidas sobre como contribuir:

- Abra uma [Discussion](https://github.com/seu-usuario/sge-sistema-gestao-escolar/discussions)
- Entre em contato por email: suporte@sge.com

## 📜 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a Licença MIT.

---

**Obrigado por contribuir! 🎉**
