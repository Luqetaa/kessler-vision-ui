# kessler_vision.py

"""
Aplicação Kessler Vision - Monitoramento de Lixo Espacial (Low Earth Orbit)
Desenvolvido de acordo com as especificações da Global Solution.
"""

def inserir_ordenado(catalogo, objeto):
    """
    Insere um objeto no catálogo mantendo a ordenação pelo 'id'.
    
    Complexidade Computacional: O(n)
    No pior caso, precisamos percorrer a lista inteira e deslocar todos os 
    elementos posteriores para realizar a inserção, resultando em custo linear.
    """
    if not catalogo:
        catalogo.append(objeto)
        return
    
    # Encontra a posição correta para inserção a fim de manter a lista ordenada
    for i, item in enumerate(catalogo):
        if objeto['id'] < item['id']:
            catalogo.insert(i, objeto)
            return
    catalogo.append(objeto)

def busca_binaria_id(catalogo, alvo_id, inicio, fim):
    """
    Realiza uma busca binária recursiva para encontrar um objeto pelo 'id'.
    Como a lista é mantida ordenada durante a inserção, não precisamos
    ordenar antes da busca, garantindo a alta performance.
    
    Complexidade Computacional: O(log n)
    A cada chamada recursiva, o espaço de busca cai pela metade.
    Isso é extremamente eficiente para grandes catálogos de satélites.
    """
    if inicio > fim:
        return -1  # Objeto não encontrado
    
    meio = (inicio + fim) // 2
    
    if catalogo[meio]['id'] == alvo_id:
        return meio
    elif catalogo[meio]['id'] > alvo_id:
        # Busca na metade inferior
        return busca_binaria_id(catalogo, alvo_id, inicio, meio - 1)
    else:
        # Busca na metade superior
        return busca_binaria_id(catalogo, alvo_id, meio + 1, fim)

def adicionar_detrito(catalogo, pilha_undo, id_detrito, nome, altitude):
    """
    Adiciona um novo detrito/satélite ao catálogo e registra a ação na pilha para permitir UNDO.
    
    Complexidade Computacional: O(n)
    A função em si faz operações O(1), mas invoca `inserir_ordenado` que é O(n).
    Portanto, a complexidade dominante é O(n).
    """
    novo_objeto = {'id': id_detrito, 'nome': nome, 'altitude': altitude}
    inserir_ordenado(catalogo, novo_objeto)
    
    # Empilha a ação para possibilitar o UNDO (Uso de Pilha - LIFO)
    pilha_undo.append({"acao": "inserir", "id_objeto": id_detrito})
    print(f"[+] Detrito '{nome}' adicionado com sucesso na altitude {altitude}km.")

def desfazer_ultima_acao(catalogo, pilha_undo):
    """
    Desfaz a última ação realizada utilizando uma Pilha (LIFO).
    
    Complexidade Computacional: O(n)
    Remover um elemento de uma posição arbitrária da lista com pop(indice) exige
    o deslocamento de elementos subsequentes, o que custa O(n) no pior caso.
    A busca binária para encontrar o elemento custa O(log n).
    A remoção do topo da pilha (pop) custa O(1).
    """
    if not pilha_undo:
        print("[-] Pilha de ações vazia. Nenhuma ação para desfazer.")
        return
    
    ultima_acao = pilha_undo.pop()
    
    if ultima_acao["acao"] == "inserir":
        id_alvo = ultima_acao["id_objeto"]
        # Usa busca binária recursiva para achar o índice rapidamente
        indice = busca_binaria_id(catalogo, id_alvo, 0, len(catalogo) - 1)
        if indice != -1:
            removido = catalogo.pop(indice)
            print(f"[UNDO] Ação desfeita! Objeto '{removido['nome']}' removido do catálogo.")
        else:
            print("[ERRO] Objeto não encontrado para desfazer.")

def simular_cascata_kessler(fragmentos, geracoes):
    """
    Função recursiva que simula o crescimento exponencial de detritos 
    (Síndrome de Kessler). A cada colisão (geração), um fragmento se divide em dois.
    
    Complexidade Computacional: O(2^n)
    Onde 'n' é o número de gerações. Ocorre uma ramificação binária a 
    cada nível recursivo se cada elemento gerar duas chamadas independentes, 
    mas da forma otimizada abaixo ela executa em O(n) na profundidade de recursão.
    (Observação: Conceitualmente o número de objetos cresce em O(2^n), 
    embora o custo de tempo desta recursão matemática simples seja O(n)).
    """
    if geracoes == 0:
        return fragmentos
    
    # Cada fragmento gera 2 novos fragmentos na próxima geração de colisão
    return simular_cascata_kessler(fragmentos * 2, geracoes - 1)

def menu():
    # Inicializando com dados pré-ordenados. 
    # ISSO É VITAL para manter O(log n) na busca sem ordenar antes de cada consulta!
    catalogo_espacial = [
        {'id': 10, 'nome': 'Corpo do Foguete H-IIA', 'altitude': 800},
        {'id': 25, 'nome': 'Satélite Inativo Iridium 33', 'altitude': 789},
        {'id': 42, 'nome': 'Fragmento Cosmos 2251', 'altitude': 815},
        {'id': 88, 'nome': 'Ferramenta Perdida (EVA)', 'altitude': 400}
    ]
    
    # Nossa pilha de ações
    pilha_undo = []
    
    while True:
        print("\n=== KESSLER VISION - Monitoramento de Órbita LEO ===")
        print("1. Listar Catálogo")
        print("2. Adicionar Novo Detrito")
        print("3. Buscar Detrito por ID (Busca Binária O(log n))")
        print("4. Desfazer Última Adição (UNDO com Pilha)")
        print("5. Simular Síndrome de Kessler (Recursão)")
        print("0. Sair")
        
        opcao = input("Escolha uma opção: ")
        
        if opcao == '1':
            print("\n--- Catálogo de Objetos LEO ---")
            for obj in catalogo_espacial:
                print(f"ID: {obj['id']:03d} | Nome: {obj['nome']} | Altitude: {obj['altitude']} km")
                
        elif opcao == '2':
            try:
                id_det = int(input("Digite o ID (numérico) do novo objeto: "))
                
                # Verifica se já existe usando nossa busca binária O(log n)
                if busca_binaria_id(catalogo_espacial, id_det, 0, len(catalogo_espacial)-1) != -1:
                    print("Erro: ID já existe no catálogo.")
                    continue
                    
                nome = input("Digite o nome/descrição do objeto: ")
                alt = int(input("Digite a altitude do objeto (km): "))
                adicionar_detrito(catalogo_espacial, pilha_undo, id_det, nome, alt)
            except ValueError:
                print("Erro: Entrada inválida. Use números inteiros para ID e Altitude.")
                
        elif opcao == '3':
            try:
                alvo = int(input("Digite o ID do detrito que deseja buscar: "))
                
                # Chamando a busca binária na lista que JÁ É MANTIDA ORDENADA
                indice = busca_binaria_id(catalogo_espacial, alvo, 0, len(catalogo_espacial) - 1)
                
                if indice != -1:
                    obj = catalogo_espacial[indice]
                    print(f"\n[+] Objeto Encontrado! Nome: {obj['nome']} | Altitude: {obj['altitude']} km")
                else:
                    print("\n[-] Objeto não encontrado no catálogo.")
            except ValueError:
                print("Erro: O ID deve ser um número inteiro.")
                
        elif opcao == '4':
            desfazer_ultima_acao(catalogo_espacial, pilha_undo)
            
        elif opcao == '5':
            try:
                frags = int(input("Digite a quantidade inicial de fragmentos na colisão (ex: 2): "))
                geracoes = int(input("Digite o número de gerações da cascata de colisões (ex: 5): "))
                total = simular_cascata_kessler(frags, geracoes)
                print(f"\n[!] ALERTA CRÍTICO: Após {geracoes} gerações de colisões, {frags} fragmentos se tornarão {total} detritos!")
            except ValueError:
                print("Erro: Entrada inválida.")
                
        elif opcao == '0':
            print("Encerrando o sistema Kessler Vision. Boa sorte nas manobras evasivas!")
            break
        else:
            print("Opção inválida.")

if __name__ == "__main__":
    menu()
