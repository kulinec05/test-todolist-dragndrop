import {useCallback, useEffect, useState} from 'react';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import DeleteIcon from '@material-ui/icons/Delete';
import {makeStyles} from '@material-ui/core/styles';
import classnames from 'classnames';
import {TodoItem, useTodoItems} from './TodoItemsContext';
import {DragDropContext, Draggable, Droppable, DropResult} from 'react-beautiful-dnd'


const spring = {
    type: 'spring',
    damping: 25,
    stiffness: 120,
    duration: 0.25,
};

const reorder = (
    list: TodoItem[],
    startIndex: number,
    endIndex: number
): TodoItem[] => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};

const useTodoItemListStyles = makeStyles({
    root: {
        listStyle: 'none',
        padding: 0,
    },
});

export const TodoItemsList = function () {
    const {todoItems,dispatch} = useTodoItems();

    const classes = useTodoItemListStyles();

    const sortedItems = todoItems.slice().sort((a, b) => {
        if (a.done && !b.done) {
            return 1;
        }

        if (!a.done && b.done) {
            return -1;
        }

        return 0;
    });

    const [sortedList, setSortedList] = useState(sortedItems);

    useEffect(() => {
        setSortedList(sortedItems)

    }, [todoItems])




    const onDragEnd = (result: DropResult): void => {
        // dropped outside the list


        if (!result.destination) {
            return;
        }

        const items: TodoItem[] = reorder(
            sortedItems,
            result.source.index,
            result.destination.index
        );
        const payload = {startIndex:result.source.index,
        endIndex:result.destination.index};

        dispatch({type:'update',data:payload})
        setSortedList(items)
        console.log(items)
    }

    useEffect(() => {

        window.addEventListener('storage', (e) => {
if ( !e) return []

            setSortedList(JSON.parse(e.newValue || '' ).todoItems)


        console.log(JSON.parse(e.newValue || '' ))
        })
    }, [setSortedList])

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId='droppable' key='key'>
                {(provided, snapshot) => (
                    <div ref={provided.innerRef}
                         {...provided.droppableProps} >
                        <ul className={classes.root}>
                            {sortedList.map((item, index) => (
                                <Draggable key={item.id} draggableId={item.id} index={index}>
                                    {(provided1, snapshot) => (

                                        <div
                                            {...provided1.dragHandleProps} key={index}
                                            style={{...provided1.draggableProps.style}} {...provided1.draggableProps}
                                            ref={provided1.innerRef}>
                                            <li key={item.id}>
                                                <TodoItemCard item={item}/>
                                            </li>
                                        </div>

                                    )}
                                </Draggable>
                            ))}
                        </ul>
                        {provided.placeholder}
                    </div>
                )}

            </Droppable>
        </DragDropContext>
    );
};

const useTodoItemCardStyles = makeStyles({
    root: {
        marginTop: 24,
        marginBottom: 24,
    },
    doneRoot: {
        textDecoration: 'line-through',
        color: '#888888',
    },
});

export const TodoItemCard = function ({item}: { item: TodoItem }) {
    const classes = useTodoItemCardStyles();
    const {dispatch} = useTodoItems();

    const handleDelete = useCallback(
        () => dispatch({type: 'delete', data: {id: item.id}}),
        [item.id, dispatch],
    );

    const handleToggleDone = useCallback(
        () =>
            dispatch({
                type: 'toggleDone',
                data: {id: item.id},
            }),
        [item.id, dispatch],
    );

    return (
        <Card
            className={classnames(classes.root, {
                [classes.doneRoot]: item.done,
            })}
        >
            <CardHeader
                action={
                    <IconButton aria-label="delete" onClick={handleDelete}>
                        <DeleteIcon/>
                    </IconButton>
                }
                title={
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={item.done}
                                onChange={handleToggleDone}
                                name={`checked-${item.id}`}
                                color="primary"
                            />
                        }
                        label={item.title}
                    />
                }
            />
            {item.details ? (
                <CardContent>
                    <Typography variant="body2" component="p">
                        {item.details}
                    </Typography>
                </CardContent>
            ) : null}
        </Card>
    );
};
