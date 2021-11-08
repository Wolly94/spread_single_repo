import { Box, Card, CardActionArea, Grid, Typography } from '@material-ui/core'
import React, { useCallback, useEffect, useState } from 'react'
import SpreadReplay from 'spread_game/dist/messages/replay/replay'
import { getPerkReplay } from 'spread_game/dist/skilltree'
import { GeneralPerk } from 'spread_game/dist/skilltree/perks/perk'
import {
    SkilledPerk,
    Skill,
    SkillTree,
} from 'spread_game/dist/skilltree/skilltree'
import MyButton from '../components/MyButton'
import Replay from '../replay/replay'
import SimpleTabs, { TabProps } from './Tabs'

interface PerkProps {
    skilledPerk: SkilledPerk
    readonly: boolean
    incLevel: (perk: GeneralPerk) => void
    setReplay: (replay: SpreadReplay) => void
}

const PerkView: React.FC<PerkProps> = (props) => {
    const skilledText =
        props.skilledPerk.level.toString() +
        '/' +
        props.skilledPerk.perk.values.length.toString()
    return (
        <Card>
            <CardActionArea
                onClick={
                    props.readonly
                        ? undefined
                        : () => {
                              props.incLevel(props.skilledPerk.perk)
                          }
                }
                onMouseEnter={() => {
                    const rep = getPerkReplay(props.skilledPerk.perk)
                    if (rep !== null) props.setReplay(rep)
                }}
            >
                <Typography variant="h4" component="h5">
                    {props.skilledPerk.perk.name + ' ' + skilledText}
                </Typography>
                <Typography variant="h6" component="h6">
                    {props.skilledPerk.perk.description(
                        props.skilledPerk.level,
                    )}
                </Typography>
            </CardActionArea>
        </Card>
    )
}

interface SkillProps {
    skill: Skill
    skilledPerks: SkilledPerk[]
    readonly: boolean
    incLevel: (perk: GeneralPerk) => void
    setReplay: (replay: SpreadReplay) => void
}

const SkillView: React.FC<SkillProps> = (props) => {
    return (
        <Grid container>
            {/*             <Typography variant="h4" component="h3">
                {props.skill.name}
            </Typography> */}
            {props.skill.perks.map((p, key) => {
                const skilled = props.skilledPerks.find(
                    (sp) => sp.perk.name === p.name,
                )
                const level = skilled === undefined ? 0 : skilled.level
                return (
                    <Grid item xs={12} key={key}>
                        <PerkView
                            skilledPerk={{ level: level, perk: p }}
                            readonly={props.readonly}
                            incLevel={props.incLevel}
                            setReplay={(replay) => props.setReplay(replay)}
                        ></PerkView>
                    </Grid>
                )
            })}
        </Grid>
    )
}

interface SkillTreeProps {
    skillTree: SkillTree
    skilledPerks: SkilledPerk[]
    readonly: boolean
    playerName: string
    save: (skilledPerks: SkilledPerk[]) => void
}

const SkillTreeView: React.FC<SkillTreeProps> = (props) => {
    const [newSkilledPerks, setNewSkilledPerks] = useState<SkilledPerk[]>([])
    const [replay, setReplay] = useState<SpreadReplay | null>(null)

    useEffect(() => {
        setNewSkilledPerks(
            props.skilledPerks.map((sp) => {
                return { ...sp }
            }),
        )
    }, [props.skilledPerks])

    const incLevel = useCallback(
        (perk: GeneralPerk) => {
            let updated = false
            const res = newSkilledPerks.map((sp) => {
                if (sp.perk.name === perk.name) {
                    updated = true
                    const maxLevel = sp.perk.values.length
                    return {
                        perk: sp.perk,
                        level: sp.level === maxLevel ? 0 : sp.level + 1,
                    }
                }
                return sp
            })
            if (!updated) {
                res.push({ level: 1, perk: perk })
            }
            setNewSkilledPerks(res)
        },
        [newSkilledPerks],
    )

    return (
        <Grid container>
            <Grid item xs={6}>
                <Typography variant="h4" component="h2">
                    {(props.readonly ? 'Watch Skilltree' : 'Modify Skilltree') +
                        ' of Player ' +
                        props.playerName}
                </Typography>
                {!props.readonly && (
                    <Grid item>
                        <MyButton onClick={() => props.save(newSkilledPerks)}>
                            Save
                        </MyButton>
                    </Grid>
                )}
                <Grid item xs={12}>
                    <SimpleTabs
                        tabs={props.skillTree.skills.map(
                            (sk): TabProps => {
                                return {
                                    label: sk.name,
                                    child: (
                                        <SkillView
                                            skill={sk}
                                            skilledPerks={newSkilledPerks}
                                            readonly={props.readonly}
                                            incLevel={incLevel}
                                            setReplay={(replay) =>
                                                setReplay(replay)
                                            }
                                        ></SkillView>
                                    ),
                                }
                            },
                        )}
                    ></SimpleTabs>
                </Grid>
            </Grid>
            <Grid item xs={6}>
                <Box>
                    {replay !== null && (
                        <Replay
                            replay={replay}
                            react={'Restart'}
                            perspectivePlayerId={0}
                        ></Replay>
                    )}
                </Box>
            </Grid>
        </Grid>
    )
}

export default SkillTreeView
