Resumo
Objetivo

Jogo de browser, visual bonito, elementos 3D. Gestão de recursos, tema sci-fi de mineração, gestão de máquinas, atributos por instância.

Stack (React possível)
three + @react-three/fiber + drei
postprocessing (bloom, vignette, outline)
rapier (física, opcional)
zustand + immer (estado)
leva (debug), vite (bundler)
Arquitetura
Defs estáticas: MachineDef, ResourceDef, UpgradeDef (JSON/TS, data-driven)
Instâncias: máquina com id, defId, stats rolados, mods, state
Stat efetivo = base × Π(mult) + Σ(add), função pura
Sim loop: tick fixo (~10 Hz), fora do React, TS puro
Render: R3F só lê store, sem lógica de jogo
Save: localStorage/IndexedDB + lastSeen (offline progress opcional)
Loop de gameplay: minerar → refinar → crédito → comprar/upgradar/reparar → desbloquear zonas
Visual
Iluminação + HDRI, materiais PBR, fog escuro, emissive + bloom
InstancedMesh pra asteroides/muitos objetos
Raios de mineração com Line + shader
UI em HTML/CSS sobreposto, labels 3D via Html
Performance: sem setState no useFrame, dpr={[1, 2]}
Câmera ortográfica
Sem perspectiva, linhas paralelas, tamanho constante
Visual isométrico (SimCity/Factorio)
Melhor leitura/seleção pra gestão
R3F: <OrthographicCamera makeDefault position={[10,10,10]} zoom={60} />
Assets 3D
Ambiente sem acesso a sites de assets
Protótipo: geometria procedural
Depois: usuário baixa .glb → /public/models, integração via useGLTF
Fontes: Kenney.nl (CC0, Space Kit), Quaternius (CC0), Poly Pizza, Sketchfab (filtrar CC)
Pendente
Confirmar: começar com procedural + câmera isométrica?
Decidir: tempo real puro vs offline progress
Decidir: projeto Vite completo vs demo single-file