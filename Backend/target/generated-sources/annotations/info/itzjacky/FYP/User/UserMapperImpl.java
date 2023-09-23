package info.itzjacky.FYP.User;

import info.itzjacky.FYP.Game.Game;
import info.itzjacky.FYP.Review.Review;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2023-09-23T17:20:46+0800",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.35.0.v20230814-2020, environment: Java 17.0.8.1 (Eclipse Adoptium)"
)
public class UserMapperImpl implements UserMapper {

    @Override
    public UserDto userToUserDTO(User user) {
        if ( user == null ) {
            return null;
        }

        UserDto.UserDtoBuilder userDto = UserDto.builder();

        List<Game> list = user.getDevelopedGames();
        if ( list != null ) {
            userDto.developedGames( new ArrayList<Game>( list ) );
        }
        userDto.email( user.getEmail() );
        userDto.id( user.getId() );
        userDto.joinDate( user.getJoinDate() );
        userDto.lastActive( user.getLastActive() );
        userDto.name( user.getName() );
        userDto.numOfReviews( user.getNumOfReviews() );
        List<Review> list1 = user.getReviews();
        if ( list1 != null ) {
            userDto.reviews( new ArrayList<Review>( list1 ) );
        }
        List<Role> list2 = user.getRole();
        if ( list2 != null ) {
            userDto.role( new ArrayList<Role>( list2 ) );
        }

        return userDto.build();
    }

    @Override
    public User userDTOToUser(UserDto userDto) {
        if ( userDto == null ) {
            return null;
        }

        User.UserBuilder user = User.builder();

        List<Game> list = userDto.getDevelopedGames();
        if ( list != null ) {
            user.developedGames( new ArrayList<Game>( list ) );
        }
        user.email( userDto.getEmail() );
        user.id( userDto.getId() );
        user.joinDate( userDto.getJoinDate() );
        user.lastActive( userDto.getLastActive() );
        user.name( userDto.getName() );
        user.numOfReviews( userDto.getNumOfReviews() );
        List<Review> list1 = userDto.getReviews();
        if ( list1 != null ) {
            user.reviews( new ArrayList<Review>( list1 ) );
        }
        List<Role> list2 = userDto.getRole();
        if ( list2 != null ) {
            user.role( new ArrayList<Role>( list2 ) );
        }

        return user.build();
    }
}
