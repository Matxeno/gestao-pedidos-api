const API_BASE = "http://localhost:5128";

const el = (id) => document.getElementById(id);

const state = {
  produtos: [],
  carrinho: [] // {produtoId, nome, precoCentavos, quantidade}
};

function moneyBRLFromCents(cents) {
  const v = (cents || 0) / 100;
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function setText(id, txt) { el(id).textContent = txt; }
function show(id) { el(id).classList.remove("hidden"); }
function hide(id) { el(id).classList.add("hidden"); }

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw await res.text();
  return res.json();
}

async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw await res.text();
  return res.json().catch(() => ({}));
}

// ============ PRODUTOS ============
async function carregarProdutos() {
  setText("produtosStatus", "Carregando...");
  const categoria = el("categoria").value.trim();
  const somenteAtivos = el("somenteAtivos").checked;

  const qs = new URLSearchParams();
  if (categoria) qs.set("categoria", categoria);
  if (somenteAtivos) qs.set("somenteAtivos", "true");

  try {
    const data = await apiGet(`/api/produtos?${qs.toString()}`);
    state.produtos = data;

    renderProdutos();
    setText("produtosStatus", `${data.length} produto(s) encontrado(s).`);
  } catch (e) {
    setText("produtosStatus", `Erro ao carregar produtos: ${e}`);
  }
}

function renderProdutos() {
  const busca = el("busca").value.trim().toLowerCase();
  const lista = el("produtosLista");
  lista.innerHTML = "";

  let produtosFiltrados = state.produtos;
  if (busca) {
    produtosFiltrados = produtosFiltrados.filter(p =>
      (p.nome || "").toLowerCase().includes(busca)
    );
  }

  if (produtosFiltrados.length === 0) {
    lista.innerHTML = `<div class="muted">Nenhum produto encontrado.</div>`;
    return;
  }

  for (const p of produtosFiltrados) {
    const preco = moneyBRLFromCents(p.precoCentavos);
    const ativo = p.ativo ? "Ativo" : "Inativo";

    const card = document.createElement("div");
    card.className = "item";
    card.innerHTML = `
      <div class="item-row">
        <strong>${p.nome}</strong>
        <strong>${preco}</strong>
      </div>
      <small>${p.categoria} • ${ativo}</small>
      <div class="actions">
        <input type="number" min="1" value="1" id="qtd_${p.id}" />
        <button class="btn btn-primary" ${!p.ativo ? "disabled" : ""} data-add="${p.id}">
          Adicionar
        </button>
      </div>
    `;

    card.querySelector(`[data-add="${p.id}"]`).addEventListener("click", () => {
      const qtd = Number(el(`qtd_${p.id}`).value);
      if (!Number.isFinite(qtd) || qtd <= 0) {
        alert("Quantidade deve ser maior que 0.");
        return;
      }
      adicionarAoCarrinho(p, qtd);
    });

    lista.appendChild(card);
  }
}

// ============ CARRINHO ============
function adicionarAoCarrinho(produto, quantidade) {
  const existente = state.carrinho.find(i => i.produtoId === produto.id);
  if (existente) {
    existente.quantidade += quantidade;
  } else {
    state.carrinho.push({
      produtoId: produto.id,
      nome: produto.nome,
      precoCentavos: produto.precoCentavos,
      quantidade
    });
  }
  renderCarrinho();
}

function removerDoCarrinho(produtoId) {
  state.carrinho = state.carrinho.filter(i => i.produtoId !== produtoId);
  renderCarrinho();
}

function atualizarQuantidade(produtoId, quantidade) {
  const item = state.carrinho.find(i => i.produtoId === produtoId);
  if (!item) return;
  item.quantidade = quantidade;
  renderCarrinho();
}

function limparCarrinho() {
  state.carrinho = [];
  renderCarrinho();
}

function renderCarrinho() {
  const lista = el("carrinhoLista");
  const vazio = el("carrinhoVazio");
  lista.innerHTML = "";

  if (state.carrinho.length === 0) {
    vazio.style.display = "block";
  } else {
    vazio.style.display = "none";
  }

  let total = 0;

  for (const item of state.carrinho) {
    const subtotal = item.quantidade * item.precoCentavos;
    total += subtotal;

    const card = document.createElement("div");
    card.className = "item";
    card.innerHTML = `
      <div class="item-row">
        <strong>${item.nome}</strong>
        <strong>${moneyBRLFromCents(subtotal)}</strong>
      </div>
      <small>${moneyBRLFromCents(item.precoCentavos)} cada</small>
      <div class="actions">
        <input type="number" min="1" value="${item.quantidade}" />
        <button class="btn btn-light">Atualizar</button>
        <button class="btn btn-danger">Remover</button>
      </div>
    `;

    const input = card.querySelector("input");
    const btnAtualizar = card.querySelectorAll("button")[0];
    const btnRemover = card.querySelectorAll("button")[1];

    btnAtualizar.addEventListener("click", () => {
      const qtd = Number(input.value);
      if (!Number.isFinite(qtd) || qtd <= 0) {
        alert("Quantidade deve ser maior que 0.");
        return;
      }
      atualizarQuantidade(item.produtoId, qtd);
    });

    btnRemover.addEventListener("click", () => removerDoCarrinho(item.produtoId));

    lista.appendChild(card);
  }

  setText("carrinhoTotal", moneyBRLFromCents(total));
}

// ============ PEDIDO ============
async function finalizarPedido() {
  hide("pedidoCriado");
  hide("erroPedido");

  const clienteId = Number(el("clienteId").value);
  if (!Number.isFinite(clienteId) || clienteId <= 0) {
    setText("erroPedido", "Informe um ClienteId válido (número > 0).");
    show("erroPedido");
    return;
  }

  if (state.carrinho.length === 0) {
    setText("erroPedido", "Adicione pelo menos 1 item no carrinho.");
    show("erroPedido");
    return;
  }

  const payload = {
    clienteId: clienteId,
    itens: state.carrinho.map(i => ({
      produtoId: i.produtoId,
      quantidade: i.quantidade
    }))
  };

  try {
    const resp = await apiPost("/api/pedidos", payload);
    const id = resp?.id ?? resp?.Id ?? resp?.pedidoId ?? resp?.PedidoId;

    setText("pedidoCriado", `Pedido criado com sucesso. Id: ${id ?? "(ver resposta)"} `);
    show("pedidoCriado");

    if (id) el("pedidoIdPagamento").value = id;

    limparCarrinho();
    await carregarPedidos();
  } catch (e) {
    setText("erroPedido", `Erro ao criar pedido: ${e}`);
    show("erroPedido");
  }
}

// ============ PEDIDOS ============
async function carregarPedidos() {
  setText("pedidosStatus", "Carregando...");
  try {
    const data = await apiGet("/api/pedidos");
    renderPedidos(data);
    setText("pedidosStatus", `${data.length} pedido(s) carregado(s).`);
  } catch (e) {
    setText("pedidosStatus", `Erro ao carregar pedidos: ${e}`);
  }
}

function renderPedidos(pedidos) {
  const lista = el("pedidosLista");
  lista.innerHTML = "";

  if (!pedidos || pedidos.length === 0) {
    lista.innerHTML = `<div class="muted">Nenhum pedido encontrado.</div>`;
    return;
  }

  for (const p of pedidos) {
    const card = document.createElement("div");
    card.className = "item";
    card.innerHTML = `
      <div class="item-row">
        <strong>Pedido #${p.id}</strong>
        <strong>${p.status}</strong>
      </div>
      <small>${new Date(p.criadoEm).toLocaleString("pt-BR")}</small>
      <div class="actions">
        <button class="btn btn-light">Ver detalhes</button>
      </div>
    `;

    card.querySelector("button").addEventListener("click", async () => {
      await carregarDetalhePedido(p.id);
    });

    lista.appendChild(card);
  }
}

async function carregarDetalhePedido(id) {
  const box = el("pedidoDetalhe");
  box.classList.remove("muted");
  box.textContent = "Carregando detalhes...";

  try {
    const det = await apiGet(`/api/pedidos/${id}`);
    const itensHtml = det.itens.map(i => `
      <div class="item" style="margin-top:10px;">
        <div class="item-row">
          <strong>${i.produtoNome ?? "Produto"} (ID ${i.produtoId})</strong>
          <strong>${moneyBRLFromCents(i.subtotalCentavos)}</strong>
        </div>
        <small>Qtd: ${i.quantidade} • Unit: ${moneyBRLFromCents(i.precoUnitarioCentavos)}</small>
      </div>
    `).join("");

    box.innerHTML = `
      <div><strong>Pedido #${det.id}</strong> • <span class="muted">${det.status}</span></div>
      <div class="muted">Criado em: ${new Date(det.criadoEm).toLocaleString("pt-BR")}</div>
      <div style="margin-top:10px;"><strong>Total:</strong> ${moneyBRLFromCents(det.totalCentavos)}</div>
      ${itensHtml}
    `;
  } catch (e) {
    box.textContent = `Erro ao carregar detalhes: ${e}`;
  }
}

// ============ PAGAMENTO ============
async function registrarPagamento() {
  setText("pagamentoStatus", "");

  const idPedido = Number(el("pedidoIdPagamento").value);
  const metodo = el("metodo").value;
  const precoCentavos = Number(el("valorCentavos").value);

  if (!Number.isFinite(idPedido) || idPedido <= 0) {
    setText("pagamentoStatus", "Informe um Id de Pedido válido.");
    return;
  }
  if (!Number.isFinite(precoCentavos) || precoCentavos <= 0) {
    setText("pagamentoStatus", "Informe um valor em centavos > 0.");
    return;
  }

  const payload = { idPedido, metodo, precoCentavos };

  try {
    await apiPost("/api/pagamentos", payload);
    setText("pagamentoStatus", "Pagamento registrado com sucesso.");
    await carregarDetalhePedido(idPedido);
    await carregarPedidos();
  } catch (e) {
    setText("pagamentoStatus", `Erro ao registrar pagamento: ${e}`);
  }
}

// ============ EVENTOS ============
function wireEvents() {
  el("btnRecarregar").addEventListener("click", carregarProdutos);
  el("busca").addEventListener("input", renderProdutos);
  el("categoria").addEventListener("input", carregarProdutos);
  el("somenteAtivos").addEventListener("change", carregarProdutos);

  el("btnLimparCarrinho").addEventListener("click", limparCarrinho);
  el("btnFinalizar").addEventListener("click", finalizarPedido);

  el("btnCarregarPedidos").addEventListener("click", carregarPedidos);

  el("btnPagar").addEventListener("click", registrarPagamento);
}

(async function init() {
  wireEvents();
  renderCarrinho();
  await carregarProdutos();
})();