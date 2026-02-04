-- Tabela de Serviços Customizáveis
create table services (
    id text primary key,
    label text not null,
    price numeric not null,
    allow_navalhado boolean default false,
    is_editable boolean default true,
    display_order integer default 0
);

-- Inserir serviços padrão
insert into
    services (
        id,
        label,
        price,
        allow_navalhado,
        is_editable,
        display_order
    )
values
    ('corte', 'Corte', 40, true, false, 1),
    ('barba', 'Barba', 35, false, false, 2),
    ('maquina', 'Maquina', 35, false, false, 3),
    ('acabamento', 'Acabamento', 15, false, false, 4),
    ('sobrancelha', 'Sobrancelha', 15, false, false, 5),
    ('combo', 'Combo', 70, false, false, 6),
    ('outros', 'Outros', 0, false, true, 7);

-- Permissões públicas
alter table services enable row level security;

create policy "Public access" on services for all using (true);