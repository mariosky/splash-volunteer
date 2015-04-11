package Data::Nodio;

use warnings;
use strict;
use Carp;

use version; our $VERSION = qv('0.0.3');

use File::Slurp::Tiny qw(read_lines);


# Module implementation here
sub new {
  my $class = shift;
  my $file_name = shift || "log/nodio-2015-4-4-0.log";
  my @file_contents = read_lines($file_name);

  carp "Nothing in that file $file_name" unless @file_contents;
  my $self = { _data => \@file_contents};
  bless $self, $class;
  return $self;
}

sub data {
  my $self = shift;
  return @{$self->{'_data'}};
}

1; # Magic true value required at end of module
__END__

=head1 NAME

Data::Nodio - Processes logs for Nodio


=head1 VERSION

This document describes Data::Nodio version 0.0.3


=head1 SYNOPSIS

    use Data::Nodio;

  
=head1 DESCRIPTION

=head1 INTERFACE 

=nead2 new( [$file_name = "log/nodio-2015-4-4-0.log" )

Creates an object with the data. No process, leaving it for latter implementation.


=head1 AUTHOR

JJ  C<< <JMERELO@cpan.org> >>


=head1 LICENCE AND COPYRIGHT

Copyright (c) 2015, JJ C<< <JMERELO@cpan.org> >>. All rights reserved.

This module is free software; you can redistribute it and/or
modify it under the same terms as Perl itself. See L<perlartistic>.


=head1 DISCLAIMER OF WARRANTY

BECAUSE THIS SOFTWARE IS LICENSED FREE OF CHARGE, THERE IS NO WARRANTY
FOR THE SOFTWARE, TO THE EXTENT PERMITTED BY APPLICABLE LAW. EXCEPT WHEN
OTHERWISE STATED IN WRITING THE COPYRIGHT HOLDERS AND/OR OTHER PARTIES
PROVIDE THE SOFTWARE "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER
EXPRESSED OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. THE
ENTIRE RISK AS TO THE QUALITY AND PERFORMANCE OF THE SOFTWARE IS WITH
YOU. SHOULD THE SOFTWARE PROVE DEFECTIVE, YOU ASSUME THE COST OF ALL
NECESSARY SERVICING, REPAIR, OR CORRECTION.

IN NO EVENT UNLESS REQUIRED BY APPLICABLE LAW OR AGREED TO IN WRITING
WILL ANY COPYRIGHT HOLDER, OR ANY OTHER PARTY WHO MAY MODIFY AND/OR
REDISTRIBUTE THE SOFTWARE AS PERMITTED BY THE ABOVE LICENCE, BE
LIABLE TO YOU FOR DAMAGES, INCLUDING ANY GENERAL, SPECIAL, INCIDENTAL,
OR CONSEQUENTIAL DAMAGES ARISING OUT OF THE USE OR INABILITY TO USE
THE SOFTWARE (INCLUDING BUT NOT LIMITED TO LOSS OF DATA OR DATA BEING
RENDERED INACCURATE OR LOSSES SUSTAINED BY YOU OR THIRD PARTIES OR A
FAILURE OF THE SOFTWARE TO OPERATE WITH ANY OTHER SOFTWARE), EVEN IF
SUCH HOLDER OR OTHER PARTY HAS BEEN ADVISED OF THE POSSIBILITY OF
SUCH DAMAGES.
