import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { h } from 'preact'
import styles from './icon.module.css'

h

export interface IconProps {
    icon: IconDefinition
}

export function Icon({ icon }: IconProps) {
    const [width, height, ligatures, unicode, svgPathData] = icon.icon

    let paths = svgPathData
    if (typeof paths === 'string') {
        paths = [paths]
    }

    return (
        <svg class={styles.icon} viewBox={`0 0 ${width} ${height}`}>
            {paths.map(path => (
                <path fill='currentColor' d={path} />
            ))}
        </svg>
    )
}
