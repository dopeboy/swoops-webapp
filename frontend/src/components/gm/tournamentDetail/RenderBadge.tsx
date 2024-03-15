import React, { ReactElement } from 'react';
import Badge from 'src/components/gm/tournamentDetail/Badge';

interface IProps {
    type: 'My Roster' | 'Autopopulated' | 'Free Agent';
}

const RenderBadge = (props: IProps): ReactElement => {
    const { type } = props;

    if (type === 'My Roster') {
        return <Badge imageUrl="my_roster_icon.png">My Roster</Badge>;
    } else if (type === 'Autopopulated') {
        return <Badge imageUrl="autopopulated_icon.png">Autopopulated</Badge>;
    } else if (type === 'Free Agent') {
        return <Badge imageUrl="free_agent_icon.png">Free Agent</Badge>;
    }
};

export default RenderBadge;
